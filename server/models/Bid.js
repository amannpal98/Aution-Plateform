const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount cannot be negative'],
  },
  isWinningBid: {
    type: Boolean,
    default: false,
  },
  autoBid: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

bidSchema.index({ auction: 1, amount: -1 });
bidSchema.index({ user: 1 });

module.exports = mongoose.model('Bid', bidSchema);
