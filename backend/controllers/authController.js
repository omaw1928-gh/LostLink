const jwt = require('jsonwebtoken');
const otplib = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/cryptoUtil');

// Helper to verify 6-digit TOTP code with ±30s drift tolerance
const verifyTotp = (token, secret) => {
  try {
    const check = otplib.verifySync({
      token: String(token).trim(),
      secret: secret,
      epochTolerance: 30,
    });
    return !!(check && check.valid);
  } catch (err) {
    return false;
  }
};


// Helper to generate standard session JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'lostlink_super_secret_jwt_key_campus_2025_secure_token',
    { expiresIn: '30d' }
  );
};

// Helper to generate short-lived MFA challenge token
const generateMfaChallengeToken = (id) => {
  return jwt.sign(
    { id, purpose: 'mfa-challenge' },
    process.env.JWT_SECRET || 'lostlink_super_secret_jwt_key_campus_2025_secure_token',
    { expiresIn: '5m' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, year, role } = req.body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    // Password validation: reject empty or whitespace-only
    if (!cleanName || !cleanEmail || !cleanPassword || cleanPassword.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid name, email, and password',
      });
    }

    // Password validation: enforce minimum length (8 chars)
    if (cleanPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Assign role (student, moderator, admin)
    let assignedRole = 'student';
    if (role === 'admin') assignedRole = 'admin';
    if (role === 'moderator') assignedRole = 'moderator';

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword, // pre('save') hashes with bcrypt work factor 12
      phone: phone ? phone.trim() : '',
      department: department || 'General',
      year: year || '1st Year',
      role: assignedRole,
    });

    const token = generateToken(user._id, user.role);

    // Return user without password or secret fields
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token (or trigger MFA challenge)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password and mfaSecret for verification
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(cleanPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // If MFA is enabled, require TOTP verification before issuing final auth token
    if (user.mfaEnabled) {
      const mfaToken = generateMfaChallengeToken(user._id);
      return res.status(200).json({
        success: true,
        mfaRequired: true,
        mfaToken,
        mfaChallengeToken: mfaToken,
        message: 'Two-Factor Authentication required. Enter the 6-digit code from Google/Microsoft Authenticator.',
        data: {
          email: user.email,
          mfaEnabled: true,
        },
      });
    }

    // Issue standard session token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify TOTP challenge during login
// @route   POST /api/auth/mfa/login-verify
// @access  Public (Requires valid mfaToken challenge)
const loginMfaVerify = async (req, res, next) => {
  try {
    const mfaToken = req.body.mfaToken || req.body.mfaChallengeToken;
    const { totpCode } = req.body;

    if (!mfaToken || !totpCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the MFA challenge token and the 6-digit TOTP code',
      });
    }

    // Verify MFA challenge token
    let decoded;
    try {
      decoded = jwt.verify(
        mfaToken,
        process.env.JWT_SECRET || 'lostlink_super_secret_jwt_key_campus_2025_secure_token'
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'MFA challenge expired or invalid. Please login again.',
      });
    }

    if (decoded.purpose !== 'mfa-challenge') {
      return res.status(401).json({
        success: false,
        message: 'Invalid challenge token purpose',
      });
    }

    const user = await User.findById(decoded.id).select('+mfaSecret');
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled for this user account',
      });
    }

    // Decrypt TOTP secret stored securely at rest
    const rawSecret = decrypt(user.mfaSecret);
    const isValid = verifyTotp(totpCode, rawSecret);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid verification code. Please check your authenticator application.',
      });
    }

    // Issue permanent auth token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'MFA authentication successful',
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        role: user.role,
        mfaEnabled: true,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate MFA enrollment (generate secret & QR code)
// @route   POST /api/auth/mfa/setup
// @access  Private
const setupMFA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+mfaTempSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate unique base32 TOTP secret
    const secret = otplib.generateSecret();
    const serviceName = 'LostLink Campus';
    const otpAuthUrl = otplib.generateURI({ issuer: serviceName, label: user.email, secret });

    // Generate QR code data URI
    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    // Encrypt secret at rest before saving to database
    user.mfaTempSecret = encrypt(secret);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA setup initiated. Scan the QR code with Google Authenticator or Microsoft Authenticator.',
      data: {
        qrCode: qrCodeDataUrl,
        manualEntryKey: secret,
        otpAuthUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify initial code & permanently enable MFA
// @route   POST /api/auth/mfa/verify
// @access  Private
const verifyAndEnableMFA = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the 6-digit TOTP verification code',
      });
    }

    const user = await User.findById(req.user._id).select('+mfaTempSecret +mfaSecret');
    if (!user || !user.mfaTempSecret) {
      return res.status(400).json({
        success: false,
        message: 'MFA setup has not been initiated. Please call /api/auth/mfa/setup first.',
      });
    }

    const rawSecret = decrypt(user.mfaTempSecret);
    const isValid = verifyTotp(token, rawSecret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code. Verification failed.',
      });
    }

    // Activate MFA
    user.mfaEnabled = true;
    user.mfaSecret = user.mfaTempSecret;
    user.mfaTempSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-Factor Authentication has been successfully enabled on your account.',
      data: {
        mfaEnabled: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disable MFA
// @route   POST /api/auth/mfa/disable
// @access  Private
const disableMFA = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your current 6-digit TOTP code to disable MFA',
      });
    }

    const user = await User.findById(req.user._id).select('+mfaSecret');
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled on this account',
      });
    }

    const rawSecret = decrypt(user.mfaSecret);
    const isValid = verifyTotp(token, rawSecret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Cannot disable MFA.',
      });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaTempSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-Factor Authentication has been disabled.',
      data: {
        mfaEnabled: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, year, profileImage } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/auth/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, moderator, or admin',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  loginMfaVerify,
  setupMFA,
  verifyAndEnableMFA,
  disableMFA,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
};
