const Kart = require('../models/Kart');
const User = require('../models/User');
const RepairReport = require('../models/RepairReport');
const EquipmentRequest = require('../models/EquipmentRequest');
const { logAction } = require('../utils/auditLog');
const { notifyAdmins } = require('../utils/notify');

// Admin: add a new kart to the fleet
async function createKart(req, res) {
  const { kartNumber } = req.body;

  if (!kartNumber) {
    return res.status(400).json({ message: 'kartNumber is required.' });
  }

  const existing = await Kart.findOne({ where: { kartNumber } });
  if (existing) {
    return res.status(409).json({ message: 'A kart with this number already exists.' });
  }

  const kart = await Kart.create({ kartNumber });
  return res.status(201).json(kart);
}

// Everyone (admin, controller, mechanic): list karts, optionally filtered by status
async function listKarts(req, res) {
  const { status } = req.query;
  const where = status ? { status } : {};

  const karts = await Kart.findAll({
    where,
    include: [{ model: User, as: 'assignedMechanic', attributes: ['id', 'fullName'] }],
    order: [['kartNumber', 'ASC']],
  });

  return res.json(karts);
}

async function updateKart(req, res) {
  const { id } = req.params;
  const { kartNumber } = req.body;

  const kart = await Kart.findByPk(id);
  if (!kart) {
    return res.status(404).json({ message: 'Kart not found.' });
  }

  if (kartNumber) kart.kartNumber = kartNumber;
  await kart.save();

  return res.json(kart);
}

async function deleteKart(req, res) {
  const { id } = req.params;

  const kart = await Kart.findByPk(id);
  if (!kart) {
    return res.status(404).json({ message: 'Kart not found.' });
  }

  await kart.destroy();
  return res.json({ message: 'Kart removed.' });
}

// Controller: daily check — flip between functional and out_of_order only.
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['functional', 'out_of_order'].includes(status)) {
    return res.status(400).json({ message: 'Status must be functional or out_of_order.' });
  }

  const kart = await Kart.findByPk(id);
  if (!kart) {
    return res.status(404).json({ message: 'Kart not found.' });
  }

  if (kart.status === 'in_repair') {
    return res.status(409).json({ message: 'This kart is currently with a mechanic and cannot be changed here.' });
  }

  kart.status = status;
  await kart.save();
  await logAction(req, 'kart_status_changed', `Kart #${kart.kartNumber} set to ${status}`);

  return res.json(kart);
}

// Mechanic: self-assign an out-of-order kart and declare the breakdown
async function takeCharge(req, res) {
  const { id } = req.params;
  const { reportedIssue } = req.body;

  const kart = await Kart.findByPk(id);
  if (!kart) {
    return res.status(404).json({ message: 'Kart not found.' });
  }

  if (kart.status !== 'out_of_order') {
    return res.status(409).json({ message: 'Only out-of-order karts can be taken charge of.' });
  }

  kart.status = 'in_repair';
  kart.assignedMechanicId = req.user.id;
  kart.repairStartedAt = new Date();
  if (reportedIssue) kart.reportedIssue = reportedIssue;
  await kart.save();
  await logAction(req, 'kart_repair_started', `${req.user.fullName} took charge of Kart #${kart.kartNumber}`);
  await notifyAdmins(`${req.user.fullName} took charge of Kart #${kart.kartNumber}${reportedIssue ? ': ' + reportedIssue : ''}`);

  return res.json(kart);
}

// Mechanic: mark the repair complete — auto-switches to functional, no admin approval needed.
// Also generates the technical data sheet (RepairReport): cause, duration, equipment used.
async function completeRepair(req, res) {
  const { id } = req.params;

  const kart = await Kart.findByPk(id);
  if (!kart) {
    return res.status(404).json({ message: 'Kart not found.' });
  }

  if (kart.status !== 'in_repair' || kart.assignedMechanicId !== req.user.id) {
    return res.status(403).json({ message: 'You can only complete repairs you took charge of.' });
  }

  const startedAt = kart.repairStartedAt || kart.updatedAt;
  const completedAt = new Date();
  const durationMinutes = Math.max(1, Math.round((completedAt - new Date(startedAt)) / 60000));

  // Gather equipment approved for this kart, by this mechanic, since the repair started.
  const approvedRequests = await EquipmentRequest.findAll({
    where: {
      kartId: kart.id,
      mechanicId: req.user.id,
      status: 'approved',
    },
  });
  const equipmentUsed = approvedRequests
    .filter((r) => new Date(r.createdAt) >= new Date(startedAt))
    .map((r) => ({ itemName: r.itemName, quantity: r.quantityRequested }));

  await RepairReport.create({
    kartId: kart.id,
    kartNumber: kart.kartNumber,
    mechanicId: req.user.id,
    cause: kart.reportedIssue,
    startedAt,
    completedAt,
    durationMinutes,
    equipmentUsed,
  });

  kart.status = 'functional';
  kart.assignedMechanicId = null;
  kart.reportedIssue = null;
  kart.repairStartedAt = null;
  await kart.save();
  await logAction(req, 'kart_repair_completed', `${req.user.fullName} completed repair on Kart #${kart.kartNumber} (${durationMinutes} min)`);
  await notifyAdmins(`Kart #${kart.kartNumber} repair completed by ${req.user.fullName} — back to functional.`);

  return res.json(kart);
}

module.exports = {
  createKart,
  listKarts,
  updateKart,
  deleteKart,
  updateStatus,
  takeCharge,
  completeRepair,
};