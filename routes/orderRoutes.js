const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

// Place a new order (protected)
router.post(
  '/',
  protect,
  [
    body('itemId').notEmpty().withMessage('itemId is required')
  ],
  orderController.placeOrder
);

// Get orders for user (protected)
router.get('/', protect, orderController.getOrders);

// Confirm delivery with OTP (protected)
router.post(
  '/confirm-delivery',
  protect,
  [
    body('orderId').notEmpty().withMessage('orderId is required'),
    body('otp').notEmpty().withMessage('OTP is required')
  ],
  orderController.confirmDelivery
);

module.exports = router; 