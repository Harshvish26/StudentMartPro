const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  photos: [String],
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String, required: true },
  college: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema); 