const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');

// Signup
router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('college').notEmpty().withMessage('College is required'),
    body('role').isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller')
  ],
  authController.signup
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// College ID Verification (protected)
router.post('/verify-college-id', protect, authController.verifyCollegeId);

// Update bank account (protected)
router.put(
  '/bank-account',
  protect,
  [
    body('accountNumber').notEmpty().withMessage('Account number is required'),
    body('ifsc').notEmpty().withMessage('IFSC is required'),
    body('bankName').notEmpty().withMessage('Bank name is required'),
    body('accountHolderName').notEmpty().withMessage('Account holder name is required')
  ],
  userController.updateBankAccount
);

// KYC document upload (protected)
router.post('/kyc-upload', protect, upload.uploadKYC.single('kycDocument'), userController.uploadKYC);

module.exports = router;
