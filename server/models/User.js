const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Define the user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});


// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  const salt = await bcryptjs.genSalt(10);
  user.password = await bcryptjs.hash(user.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
