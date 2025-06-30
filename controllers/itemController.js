const Item = require('../models/Item');
const { validationResult } = require('express-validator');

// Add new item
exports.addItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, description, price, city, college } = req.body;
    const photos = req.files ? req.files.map(file => file.filename) : [];
    const sellerId = req.user.id;
    const item = new Item({ title, description, price, photos, sellerId, city, college });
    await item.save();
    res.status(201).json({ message: 'Item added', item });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get/search items
exports.getItems = async (req, res) => {
  try {
    const { city, college, search } = req.query;
    let filter = {};
    if (city) filter.city = city;
    if (college) filter.college = college;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const items = await Item.find(filter).populate('sellerId', 'name college');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 