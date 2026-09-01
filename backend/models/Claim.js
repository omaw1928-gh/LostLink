const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Claim must be associated with an item'],
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant user is required'],
    },
    message: {
      type: String,
      required: [true, 'Please provide details or verification proof for your claim'],
      trim: true,
      maxlength: [1000, 'Claim message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ item: 1, claimant: 1 });
claimSchema.index({ claimant: 1 });

module.exports = mongoose.model('Claim', claimSchema);
