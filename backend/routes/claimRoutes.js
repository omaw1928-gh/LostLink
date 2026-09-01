const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getClaimById,
  updateClaimStatus,
  deleteClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All claim routes require authentication

router.route('/').post(createClaim);
router.get('/my', getMyClaims);
router.route('/:id').get(getClaimById).put(updateClaimStatus).delete(deleteClaim);

module.exports = router;
