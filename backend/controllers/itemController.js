const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Get all items with search, filter, sort, pagination
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      location,
      status,
      search,
      reportedBy,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter by type (lost / found)
    if (type && ['lost', 'found'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    // Filter by user
    if (reportedBy) {
      query.reportedBy = reportedBy;
    }

    // Text search in title, description, location
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
        { category: regex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    sort[sortBy] = order;

    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('reportedBy', 'name email phone department year profileImage')
        .sort(sort)
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

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'reportedBy',
      'name email phone department year profileImage'
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Also fetch claims count or claims if requester is the owner
    let claims = [];
    if (req.user && (req.user._id.toString() === item.reportedBy._id.toString() || req.user.role === 'admin')) {
      claims = await Claim.find({ item: item._id }).populate('claimant', 'name email phone department year');
    }

    res.status(200).json({
      success: true,
      data: item,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lost or found item report
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const { title, description, type, category, location, date, time, image } = req.body;

    if (!title || !description || !type || !category || !location || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, type, category, location, and date',
      });
    }

    const item = await Item.create({
      title,
      description,
      type: type.toLowerCase(),
      category,
      location,
      date,
      time: time || '',
      image: image || '',
      reportedBy: req.user._id,
      status: 'active',
    });

    const populatedItem = await Item.findById(item._id).populate(
      'reportedBy',
      'name email phone department year profileImage'
    );

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully`,
      data: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing item report
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Check ownership or admin
    if (
      item.reportedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item report',
      });
    }

    const allowedUpdates = [
      'title',
      'description',
      'category',
      'location',
      'date',
      'time',
      'image',
      'status',
      'type',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    const updatedItem = await item.save();
    await updatedItem.populate('reportedBy', 'name email phone department year profileImage');

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an item report
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Check ownership or admin
    if (
      item.reportedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item report',
      });
    }

    // Delete associated claims
    await Claim.deleteMany({ item: item._id });
    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item and associated claims deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark item status as resolved/claimed
// @route   PATCH /api/items/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'claimed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, claimed, or resolved',
      });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    if (
      item.reportedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change status for this item',
      });
    }

    item.status = status;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Item marked as ${status}`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  updateStatus,
};
