const Wallet = require('../models/Wallet');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const { validationResult } = require('express-validator');

// Get wallet balance and transactions for seller
exports.getWallet = async (req, res) => {
  try {
    const sellerId = req.user.id;
    let wallet = await Wallet.findOne({ sellerId })
      .populate('transactions.fromUser', 'name')
      .populate('transactions.toUser', 'name');
    if (!wallet) {
      wallet = new Wallet({ sellerId, balance: 0, transactions: [] });
      await wallet.save();
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const sellerId = req.user.id;
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ sellerId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    const withdrawal = new WithdrawalRequest({ sellerId, amount, status: 'pending' });
    await withdrawal.save();
    res.status(201).json({ message: 'Withdrawal request submitted', withdrawal });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 