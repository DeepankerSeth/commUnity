import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId && !this.facebookId && !this.appleId; },
    minlength: 7
  },
  googleId: String,
  facebookId: String,
  appleId: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutTime: { type: Date }
});

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

userSchema.methods.incrementLoginAttempts = function() {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockoutTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
  }
  return this.save();
};

userSchema.methods.resetLoginAttempts = function() {
  this.failedLoginAttempts = 0;
  this.lockoutTime = null;
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;