const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/mfa/login-verify', loginMfaVerify);

// Protected user routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Protected MFA management routes
router.post('/mfa/setup', protect, setupMFA);
router.post('/mfa/verify', protect, verifyAndEnableMFA);
router.post('/mfa/disable', protect, disableMFA);

// Admin-only RBAC management routes
router.get('/admin/users', protect, authorizeRoles('admin'), getAllUsers);
router.patch('/admin/users/:id/role', protect, authorizeRoles('admin'), updateUserRole);

module.exports = router;

