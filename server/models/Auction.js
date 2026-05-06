const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  images: [{
    type: String,
  }],
  category: {
    type: String,
    enum: ['Electronics', 'Art', 'Jewelry', 'Vehicles', 'Fashion', 'Collectibles', 'Real Estate', 'Sports', 'Other'],
    default: 'Other',
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price cannot be negative'],
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  minIncrement: {
    type: Number,
    default: 1,
    min: 0,
  },
  reservePrice: {
    type: Number,
    default: 0,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'cancelled'],
    default: 'active',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  totalBids: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Auto-update status based on endTime
auctionSchema.virtual('isActive').get(function () {
  return this.status === 'active' && new Date() < this.endTime;
});

auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ category: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
