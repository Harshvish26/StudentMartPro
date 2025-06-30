const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  sellerPayout: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  deliveryStatus: { type: String, enum: ['pending', 'delivered', 'cancelled'], default: 'pending' },
  deliveryOTP: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema); 