const User = require('../models/User');
const { validationResult } = require('express-validator');
const path = require('path');

// Update bank account details
exports.updateBankAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { accountNumber, ifsc, bankName, accountHolderName } = req.body;
    if (!accountNumber || !ifsc || !bankName || !accountHolderName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bankAccount: { accountNumber, ifsc, bankName, accountHolderName } },
      { new: true }
    );
    res.json({ message: 'Bank account updated', bankAccount: user.bankAccount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload KYC document
exports.uploadKYC = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const kycDocumentType = req.body.kycDocumentType || path.extname(req.file.originalname).replace('.', '').toUpperCase();
    const kycDocumentUrl = `/public/kyc_uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        kycStatus: 'pending',
        kycDocumentType,
        kycDocumentUrl
      },
      { new: true }
    );
    res.json({ message: 'KYC document uploaded', kycStatus: user.kycStatus, kycDocumentType: user.kycDocumentType, kycDocumentUrl: user.kycDocumentUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 