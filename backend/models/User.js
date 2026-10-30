const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Never return password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
    },
    year: {
      type: String,
      trim: true,
      default: '1st Year',
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'moderator'],
      default: 'student',
    },
    profileImage: {
      type: String,
      default: '',
    },
    // Multi-Factor Authentication (TOTP)
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      select: false, // Stored encrypted at rest via AES-256-GCM
    },
    mfaTempSecret: {
      type: String,
      select: false, // Temporary unconfirmed secret during MFA setup
    },
  },
  {
    timestamps: true,
  }
);

// Hash password with bcrypt work factor 12 before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  // Enforce bcrypt work factor 12 as preferred in assignment specification
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method with safe legacy migration
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;

  // Check if current hash is a valid bcrypt format ($2a$, $2b$, or $2y$)
  if (
    this.password.startsWith('$2a$') ||
    this.password.startsWith('$2b$') ||
    this.password.startsWith('$2y$')
  ) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Safe migration for legacy plain-text accounts:
  // If plain-text matches, immediately upgrade the account to bcrypt work factor 12
  const isPlainMatch = enteredPassword === this.password;
  if (isPlainMatch) {
    const salt = await bcrypt.genSalt(12);
    const upgradedHash = await bcrypt.hash(enteredPassword, salt);
    await this.constructor.updateOne({ _id: this._id }, { password: upgradedHash });
  }
  return isPlainMatch;
};

module.exports = mongoose.model('User', userSchema);
