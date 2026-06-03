const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const PLANS = {
  basic:    { price: 7.99,  duration: 30, label: 'Basic' },
  standard: { price: 12.99, duration: 30, label: 'Standard' },
  premium:  { price: 17.99, duration: 30, label: 'Premium' }
};

router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

router.post('/activate', protect, async (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Noto\'g\'ri plan' });

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + PLANS[plan].duration);

  await User.findByIdAndUpdate(req.user._id, { subscription: plan, subscriptionExpiry: expiry });
  res.json({ success: true, message: `${PLANS[plan].label} faollashtirildi!`, expiry });
});

router.get('/status', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    subscription: user.subscription,
    subscriptionExpiry: user.subscriptionExpiry,
    isActive: user.hasActiveSubscription()
  });
});

module.exports = router;