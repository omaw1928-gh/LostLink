const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @desc    Submit a new claim on an item
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res, next) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide itemId and a detailed claim message',
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Prevent user from claiming their own reported item
    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a claim on your own reported item',
      });
    }

    // Prevent duplicate pending claims from same claimant on this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: 'pending',
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active pending claim on this item',
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      message,
      status: 'pending',
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('item')
      .populate('claimant', 'name email phone department year profileImage');

    res.status(201).json({
      success: true,
      message: 'Claim request submitted successfully',
      data: populatedClaim,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims submitted by or received by current user
// @route   GET /api/claims/my
// @access  Private
const getMyClaims = async (req, res, next) => {
  try {
    // 1. Claims submitted by the user
    const submittedClaims = await Claim.find({ claimant: req.user._id })
      .populate({
        path: 'item',
        populate: {
          path: 'reportedBy',
          select: 'name email phone department year profileImage',
        },
      })
      .populate('claimant', 'name email phone department year profileImage')
      .sort({ createdAt: -1 });

    // 2. Claims received on items reported by the user
    const userItems = await Item.find({ reportedBy: req.user._id }).select('_id');
    const userItemIds = userItems.map((item) => item._id);

    const receivedClaims = await Claim.find({ item: { $in: userItemIds } })
      .populate('item')
      .populate('claimant', 'name email phone department year profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        submitted: submittedClaims,
        received: receivedClaims,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single claim by ID
// @route   GET /api/claims/:id
// @access  Private
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate({
        path: 'item',
        populate: {
          path: 'reportedBy',
          select: 'name email phone department year profileImage',
        },
      })
      .populate('claimant', 'name email phone department year profileImage');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    // Allow claimant, item owner, or admin to view
    const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
    const isOwner =
      claim.item &&
      claim.item.reportedBy &&
      claim.item.reportedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this claim',
      });
    }

    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update claim status (approve / reject)
// @route   PUT /api/claims/:id
// @access  Private
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected',
      });
    }

    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    // Verify permission: Only item owner or admin can approve/reject
    const isOwner =
      claim.item && claim.item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the item reporter or an admin can approve/reject claims',
      });
    }

    claim.status = status;
    await claim.save();

    // If approved, update the item's status to 'claimed' or 'resolved'
    if (status === 'approved' && claim.item) {
      await Item.findByIdAndUpdate(claim.item._id, { status: 'claimed' });
      // Reject any other pending claims on this item
      await Claim.updateMany(
        { item: claim.item._id, _id: { $ne: claim._id }, status: 'pending' },
        { status: 'rejected' }
      );
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate('item')
      .populate('claimant', 'name email phone department year profileImage');

    res.status(200).json({
      success: true,
      message: `Claim status updated to ${status}`,
      data: updatedClaim,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a claim
// @route   DELETE /api/claims/:id
// @access  Private
const deleteClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    const isClaimant = claim.claimant.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this claim',
      });
    }

    await claim.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Claim deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaimById,
  updateClaimStatus,
  deleteClaim,
};
