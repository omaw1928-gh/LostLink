const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please specify type (lost or found)'],
      enum: ['lost', 'found'],
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Electronics',
        'ID Card',
        'Wallet',
        'Keys',
        'Books',
        'Clothing',
        'Accessories',
        'Documents',
        'Other',
      ],
    },
    location: {
      type: String,
      required: [true, 'Please specify the location on campus'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    date: {
      type: String,
      required: [true, 'Please specify the date of incident'],
    },
    time: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'claimed', 'resolved'],
      default: 'active',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search & Filter compound indices
itemSchema.index({ title: 'text', description: 'text', location: 'text' });
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Item', itemSchema);
