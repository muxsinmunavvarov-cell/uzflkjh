const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email allaqachon bor' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ success: false, message: 'Email yoki parol xato' });
    }
    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, subscription: user.subscription }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Profil
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Til o'zgartirish
router.put('/language', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { language: req.body.language });
  res.json({ success: true, message: 'Til o\'zgartirildi' });
});

// Watchlist
router.put('/watchlist/:movieId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.watchlist.indexOf(req.params.movieId);
  if (idx === -1) user.watchlist.push(req.params.movieId);
  else user.watchlist.splice(idx, 1);
  await user.save();
  res.json({ success: true, watchlist: user.watchlist });
});

module.exports = router;