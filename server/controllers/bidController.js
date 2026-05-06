const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const User = require('../models/User');

// @desc    Place a bid
// @route   POST /api/bids
const placeBid = async (req, res) => {
  try {
    const { auctionId, amount } = req.body;

    if (!auctionId || !amount) {
      return res.status(400).json({ message: 'Auction ID and amount are required' });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    // Check if auction is active
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    // Check if auction has ended
    if (new Date() > auction.endTime) {
      await Auction.findByIdAndUpdate(auctionId, { status: 'ended' });
      return res.status(400).json({ message: 'Auction has ended' });
    }

    // Seller cannot bid on their own auction
    if (auction.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }

    // Validate bid amount
    const minBid = auction.currentBid > 0
      ? auction.currentBid + auction.minIncrement
      : auction.startingPrice;

    if (amount < minBid) {
      return res.status(400).json({
        message: `Bid must be at least $${minBid.toFixed(2)}`,
      });
    }

    // Create bid
    const bid = await Bid.create({
      user: req.user._id,
      auction: auctionId,
      amount,
    });

    // Update auction
    await Auction.findByIdAndUpdate(auctionId, {
      currentBid: amount,
      highestBidder: req.user._id,
      $inc: { totalBids: 1 },
    });

    await bid.populate('user', 'name');

    // Notify via socket
    req.io.to(auctionId).emit('new_bid', {
      auctionId,
      bid: {
        _id: bid._id,
        amount: bid.amount,
        user: bid.user,
        createdAt: bid.createdAt,
      },
      currentBid: amount,
      highestBidder: { _id: req.user._id, name: req.user.name },
    });

    res.status(201).json({ success: true, bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bids for an auction
// @route   GET /api/bids/:auctionId
const getAuctionBids = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's bid history
// @route   GET /api/bids/user/history
const getUserBids = async (req, res) => {
  try {
    const bids = await Bid.find({ user: req.user._id })
      .populate({
        path: 'auction',
        populate: { path: 'seller', select: 'name' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's won auctions
// @route   GET /api/bids/user/won
const getWonAuctions = async (req, res) => {
  try {
    const wonAuctions = await Auction.find({
      winner: req.user._id,
      status: 'ended',
    })
      .populate('seller', 'name')
      .sort({ updatedAt: -1 });

    res.json({ success: true, auctions: wonAuctions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { placeBid, getAuctionBids, getUserBids, getWonAuctions };
