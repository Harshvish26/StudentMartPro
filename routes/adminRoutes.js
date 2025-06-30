const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');

// Get all withdrawal requests (admin only)
router.get('/withdrawals', protect, adminController.getWithdrawals);

// Approve/reject withdrawal (admin only)
router.put(
  '/withdrawals/:id',
  protect,
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')
  ],
  adminController.updateWithdrawalStatus
);

// Get platform (owner/admin) wallet info (admin only)
router.get('/wallet', protect, adminController.getPlatformWallet);

module.exports = router; 