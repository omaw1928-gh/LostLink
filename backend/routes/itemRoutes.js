const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  updateStatus,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

// Optional auth extraction on GET /:id so owner can see claims
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'lostlink_super_secret_jwt_key_campus_2025_secure_token'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Continue unauthenticated if token invalid
    }
  }
  next();
};

router.route('/').get(getItems).post(protect, createItem);
router
  .route('/:id')
  .get(optionalProtect, getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
