const EquipmentRequest = require('../models/EquipmentRequest');
const StockItem = require('../models/StockItem');
const User = require('../models/User');
const Kart = require('../models/Kart');
const Notification = require('../models/Notification');
const { sendEquipmentRequestResultEmail } = require('../utils/email');

async function notifyMechanic(mechanicId, message) {
  try {
    await Notification.create({ userId: mechanicId, message });
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
}

// Mechanic: request equipment for a repair, by name only — they never see actual stock.
async function createRequest(req, res) {
  const { itemName, quantityRequested, kartId } = req.body;

  if (!itemName) {
    return res.status(400).json({ message: 'itemName is required.' });
  }

  const request = await EquipmentRequest.create({
    itemName,
    quantityRequested: quantityRequested || 1,
    kartId: kartId || null,
    mechanicId: req.user.id,
  });

  return res.status(201).json(request);
}

async function listMyRequests(req, res) {
  const requests = await EquipmentRequest.findAll({
    where: { mechanicId: req.user.id },
    include: [{ model: Kart, as: 'kart', attributes: ['id', 'kartNumber'] }],
    order: [['createdAt', 'DESC']],
  });
  return res.json(requests);
}

async function listAllRequests(req, res) {
  const { status } = req.query;
  const where = status ? { status } : {};

  const requests = await EquipmentRequest.findAll({
    where,
    include: [
      { model: User, as: 'mechanic', attributes: ['id', 'fullName'] },
      { model: Kart, as: 'kart', attributes: ['id', 'kartNumber'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  return res.json(requests);
}

// Admin: approve — links to a real stock item, deducts quantity, notifies + emails the mechanic.
async function approveRequest(req, res) {
  const { id } = req.params;
  const { stockItemId, quantity } = req.body;

  if (!stockItemId) {
    return res.status(400).json({ message: 'stockItemId is required to approve a request.' });
  }

  const request = await EquipmentRequest.findByPk(id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found.' });
  }
  if (request.status !== 'pending') {
    return res.status(409).json({ message: 'This request has already been resolved.' });
  }

  const stockItem = await StockItem.findByPk(stockItemId);
  if (!stockItem) {
    return res.status(404).json({ message: 'Stock item not found.' });
  }

  const deductAmount = quantity || request.quantityRequested;

  if (stockItem.quantity < deductAmount) {
    return res.status(409).json({ message: 'Not enough stock available to approve this request.' });
  }

  stockItem.quantity -= deductAmount;
  await stockItem.save();

  request.status = 'approved';
  request.stockItemId = stockItemId;
  await request.save();

  const mechanic = await User.findByPk(request.mechanicId);
  await notifyMechanic(mechanic.id, `Your request for ${deductAmount}× ${request.itemName} was approved.`);
  try {
    await sendEquipmentRequestResultEmail(mechanic.email, mechanic.fullName, request.itemName, deductAmount, true);
  } catch (err) {
    console.error('Email failed (approval still succeeded):', err.message);
  }

  return res.json({ message: 'Request approved and stock deducted.', request });
}

// Admin: reject — nothing deducted, notifies + emails the mechanic.
async function rejectRequest(req, res) {
  const { id } = req.params;

  const request = await EquipmentRequest.findByPk(id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found.' });
  }
  if (request.status !== 'pending') {
    return res.status(409).json({ message: 'This request has already been resolved.' });
  }

  request.status = 'rejected';
  await request.save();

  const mechanic = await User.findByPk(request.mechanicId);
  await notifyMechanic(mechanic.id, `Your request for ${request.quantityRequested}× ${request.itemName} was rejected.`);
  try {
    await sendEquipmentRequestResultEmail(mechanic.email, mechanic.fullName, request.itemName, request.quantityRequested, false);
  } catch (err) {
    console.error('Email failed (rejection still succeeded):', err.message);
  }

  return res.json({ message: 'Request rejected.', request });
}

module.exports = { createRequest, listMyRequests, listAllRequests, approveRequest, rejectRequest };