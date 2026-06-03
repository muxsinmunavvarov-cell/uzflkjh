const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  subscription: { type: String, enum: ['none','basic','standard','premium'], default: 'none' },
  subscriptionExpiry: { type: Date, default: null },
  watchlist: [{ type: String }],
  language: { type: String, enum: ['uz','ru','en','tr','ar'], default: 'uz' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.checkPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.hasActiveSubscription = function() {
  if (this.subscription === 'none') return false;
  return this.subscriptionExpiry > new Date();
};

module.exports = mongoose.model('User', userSchema);