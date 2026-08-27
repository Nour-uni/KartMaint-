const StockItem = require('../models/StockItem');

// Admin only — mechanics never call this
async function createStockItem(req, res) {
  const { name, quantity, lowStockThreshold } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'name is required.' });
  }

  const existing = await StockItem.findOne({ where: { name } });
  if (existing) {
    return res.status(409).json({ message: 'A stock item with this name already exists.' });
  }

  const item = await StockItem.create({
    name,
    quantity: quantity ?? 0,
    lowStockThreshold: lowStockThreshold ?? 5,
  });

  return res.status(201).json(item);
}

async function listStockItems(req, res) {
  const items = await StockItem.findAll({ order: [['name', 'ASC']] });
  return res.json(items);
}

async function updateStockItem(req, res) {
  const { id } = req.params;
  const { name, quantity, lowStockThreshold } = req.body;

  const item = await StockItem.findByPk(id);
  if (!item) {
    return res.status(404).json({ message: 'Stock item not found.' });
  }

  if (name !== undefined) item.name = name;
  if (quantity !== undefined) item.quantity = quantity;
  if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;
  await item.save();

  return res.json(item);
}

async function deleteStockItem(req, res) {
  const { id } = req.params;

  const item = await StockItem.findByPk(id);
  if (!item) {
    return res.status(404).json({ message: 'Stock item not found.' });
  }

  await item.destroy();
  return res.json({ message: 'Stock item removed.' });
}

module.exports = { createStockItem, listStockItems, updateStockItem, deleteStockItem };