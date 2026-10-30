const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verifies JWT bearer token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'lostlink_super_secret_jwt_key_campus_2025_secure_token'
    );

    // Prevent using short-lived MFA challenge tokens on general protected APIs
    if (decoded.purpose === 'mfa-challenge') {
      return res.status(401).json({
        success: false,
        message: 'MFA verification required: challenge token cannot access protected APIs',
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Restrict to admin users only
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required',
    });
  }
};

/**
 * Role-Based Access Control (RBAC): restrict route to specific roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized for this resource`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  adminOnly,
  authorizeRoles,
};
