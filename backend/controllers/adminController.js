const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalItems,
      lostItems,
      foundItems,
      resolvedItems,
      claimedItems,
      activeItems,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      recentItems,
      recentUsers,
      categoryStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Item.countDocuments(),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'resolved' }),
      Item.countDocuments({ status: 'claimed' }),
      Item.countDocuments({ status: 'active' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
      Claim.countDocuments({ status: 'approved' }),
      Claim.countDocuments({ status: 'rejected' }),
      Item.find()
        .populate('reportedBy', 'name email department')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5),
      Item.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          admins: totalAdmins,
        },
        items: {
          total: totalItems,
          lost: lostItems,
          found: foundItems,
          resolved: resolvedItems,
          claimed: claimedItems,
          active: activeItems,
        },
        claims: {
          total: totalClaims,
          pending: pendingClaims,
          approved: approvedClaims,
          rejected: rejectedClaims,
        },
        categoryBreakdown: categoryStats.map((c) => ({
          category: c._id,
          count: c.count,
        })),
        recentItems,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search & filter
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { department: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account',
      });
    }

    // Cascade delete items and claims
    const userItems = await Item.find({ reportedBy: user._id });
    const userItemIds = userItems.map((i) => i._id);

    await Promise.all([
      Claim.deleteMany({
        $or: [{ claimant: user._id }, { item: { $in: userItemIds } }],
      }),
      Item.deleteMany({ reportedBy: user._id }),
      user.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: 'User and all related records deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items for moderation
// @route   GET /api/admin/items
// @access  Private/Admin
const getAllItems = async (req, res, next) => {
  try {
    const { type, category, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (type && type !== 'all') query.type = type.toLowerCase();
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'all') query.status = status.toLowerCase();

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('reportedBy', 'name email phone department year')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Item.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item status by admin
// @route   PUT /api/admin/items/:id/status
// @access  Private/Admin
const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'claimed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, claimed, or resolved',
      });
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email phone department year');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Item status changed to ${status}`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item by admin
// @route   DELETE /api/admin/items/:id
// @access  Private/Admin
const deleteItemByAdmin = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    await Claim.deleteMany({ item: item._id });
    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item and associated claims deleted by administrator',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims for moderation
// @route   GET /api/admin/claims
// @access  Private/Admin
const getAllClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate({
          path: 'item',
          populate: {
            path: 'reportedBy',
            select: 'name email phone department',
          },
        })
        .populate('claimant', 'name email phone department year')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Claim.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: claims.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: claims,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllItems,
  updateItemStatus,
  deleteItemByAdmin,
  getAllClaims,
};
