const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  college: String,
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  verifiedCollegeId: { type: Boolean, default: false },
  // OTP verification fields
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  // Bank account details
  bankAccount: {
    accountNumber: String,
    ifsc: String,
    bankName: String,
    accountHolderName: String
  },
  // KYC fields
  kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  kycDocumentType: { type: String },
  kycDocumentUrl: { type: String }
});

module.exports = mongoose.model('User', userSchema); 