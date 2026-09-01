const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllItems,
  updateItemStatus,
  deleteItemByAdmin,
  getAllClaims,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.get('/items', getAllItems);
router.put('/items/:id/status', updateItemStatus);
router.delete('/items/:id', deleteItemByAdmin);

router.get('/claims', getAllClaims);

module.exports = router;
