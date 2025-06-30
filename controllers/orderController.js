const Order = require('../models/Order');
const Item = require('../models/Item');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const generateOTP = require('../utils/otpGenerator');
const { validationResult } = require('express-validator');

// Place a new order
exports.placeOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { itemId } = req.body;
    const buyerId = req.user.id;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const amount = item.price;
    const commission = Math.round(amount * 0.1); // 10% commission
    const sellerPayout = amount - commission;
    const deliveryOTP = generateOTP();
    const order = new Order({
      buyerId,
      sellerId: item.sellerId,
      itemId,
      amount,
      commission,
      sellerPayout,
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      deliveryOTP
    });
    await order.save();
    res.status(201).json({ message: 'Order placed', order, deliveryOTP });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Confirm delivery with OTP and split payment
exports.confirmDelivery = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { orderId, otp } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.deliveryStatus === 'delivered') return res.status(400).json({ message: 'Order already delivered' });
    if (order.deliveryOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    // Update order status
    order.deliveryStatus = 'delivered';
    order.paymentStatus = 'paid';
    await order.save();

    // Seller wallet update
    let sellerWallet = await Wallet.findOne({ sellerId: order.sellerId });
    if (!sellerWallet) {
      sellerWallet = new Wallet({ sellerId: order.sellerId, balance: 0, transactions: [] });
    }
    sellerWallet.balance += order.sellerPayout;
    sellerWallet.transactions.push({
      type: 'credit',
      amount: order.sellerPayout,
      description: `Order #${order._id} delivered`,
      fromUser: order.buyerId,
      toUser: order.sellerId
    });
    await sellerWallet.save();

    // Platform (owner) wallet update
    const owner = await User.findOne({ role: 'admin' }) || await User.findOne({ role: 'owner' });
    if (owner) {
      let ownerWallet = await Wallet.findOne({ sellerId: owner._id });
      if (!ownerWallet) {
        ownerWallet = new Wallet({ sellerId: owner._id, balance: 0, transactions: [] });
      }
      ownerWallet.balance += order.commission;
      ownerWallet.transactions.push({
        type: 'credit',
        amount: order.commission,
        description: `Commission from order #${order._id}`,
        fromUser: order.buyerId,
        toUser: owner._id
      });
      await ownerWallet.save();
    }

    res.json({ message: 'Delivery confirmed, payment split done.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get orders for a user (buyer or seller)
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ $or: [ { buyerId: userId }, { sellerId: userId } ] })
      .populate('itemId')
      .populate('buyerId', 'name')
      .populate('sellerId', 'name');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 