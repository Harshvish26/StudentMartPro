const WithdrawalRequest = require('../models/WithdrawalRequest');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all withdrawal requests
exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find().populate('sellerId', 'name email');
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve or reject a withdrawal request
exports.updateWithdrawalStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const withdrawal = await WithdrawalRequest.findById(id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    withdrawal.status = status;
    await withdrawal.save();

    if (status === 'approved') {
      // Deduct from wallet
      const wallet = await Wallet.findOne({ sellerId: withdrawal.sellerId });
      if (wallet) {
        wallet.balance -= withdrawal.amount;
        wallet.transactions.push({
          type: 'debit',
          amount: withdrawal.amount,
          description: 'Withdrawal approved',
        });
        await wallet.save();
      }
    }
    res.json({ message: `Withdrawal ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get platform (owner/admin) wallet info
exports.getPlatformWallet = async (req, res) => {
  try {
    // Only admin can access
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const owner = await User.findOne({ role: 'admin' }) || await User.findOne({ role: 'owner' });
    if (!owner) return res.status(404).json({ message: 'Owner/admin user not found' });
    const wallet = await Wallet.findOne({ sellerId: owner._id });
    if (!wallet) return res.status(404).json({ message: 'Platform wallet not found' });
    res.json({ balance: wallet.balance, transactions: wallet.transactions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 