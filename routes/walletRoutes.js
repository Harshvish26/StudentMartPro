const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const walletController = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');

// Get wallet info (protected)
router.get('/', protect, walletController.getWallet);

// Request withdrawal (protected)
router.post(
  '/withdraw',
  protect,
  [
    body('amount').isNumeric().withMessage('Amount must be a number').custom(value => value > 0).withMessage('Amount must be positive')
  ],
  walletController.requestWithdrawal
);

module.exports = router; 