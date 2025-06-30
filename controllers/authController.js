const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const generateOTP = require('../utils/otpGenerator');
const sendEmail = require('../utils/emailSender');

// Signup
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, email, password, college, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    // OTP logic
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    user = new User({ name, email, password: hashedPassword, college, role, otp, otpExpiry, isVerified: false });
    await user.save();

    // Send OTP email
    await sendEmail(email, 'Your College Mart OTP', `Your OTP for College Mart signup is: ${otp}`);

    res.status(201).json({ message: 'Signup successful. OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Account not verified. Please verify OTP sent to your email.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, college: user.college, role: user.role, verifiedCollegeId: user.verifiedCollegeId } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// College ID Verification (now used for OTP verification)
exports.verifyCollegeId = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (!user.otp || !user.otpExpiry) return res.status(400).json({ message: 'No OTP found. Please signup again.' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired' });
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ message: 'OTP verified. Account activated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 