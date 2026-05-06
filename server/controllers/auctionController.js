const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

// @desc    Get all auctions
// @route   GET /api/auctions
const getAuctions = async (req, res) => {
  try {
    const { status, category, search, sort, page = 1, limit = 12 } = req.query;

    // Auto-end expired auctions
    await Auction.updateMany(
      { status: 'active', endTime: { $lte: new Date() } },
      { status: 'ended' }
    );

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const sortOptions = {
      newest: { createdAt: -1 },
      ending: { endTime: 1 },
      'price-low': { currentBid: 1 },
      'price-high': { currentBid: -1 },
      popular: { totalBids: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const total = await Auction.countDocuments(query);
    const auctions = await Auction.find(query)
      .populate('seller', 'name avatar')
      .populate('highestBidder', 'name')
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      auctions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single auction
// @route   GET /api/auctions/:id
const getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email avatar')
      .populate('highestBidder', 'name')
      .populate('winner', 'name email');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Increment views
    await Auction.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create auction
// @route   POST /api/auctions
const createAuction = async (req, res) => {
  try {
    const {
      title, description, images, category,
      startingPrice, minIncrement, reservePrice, endTime,
    } = req.body;

    if (new Date(endTime) <= new Date()) {
      return res.status(400).json({ message: 'End time must be in the future' });
    }

    const auction = await Auction.create({
      title, description,
      images: images || [],
      category: category || 'Other',
      startingPrice,
      currentBid: 0,
      minIncrement: minIncrement || 1,
      reservePrice: reservePrice || 0,
      endTime,
      seller: req.user._id,
    });

    await auction.populate('seller', 'name avatar');
    res.status(201).json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    if (
      auction.seller.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (auction.totalBids > 0) {
      return res.status(400).json({ message: 'Cannot edit auction with existing bids' });
    }

    const updated = await Auction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'name avatar');

    res.json({ success: true, auction: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    if (
      auction.seller.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Bid.deleteMany({ auction: req.params.id });
    await Auction.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Auction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller's auctions
// @route   GET /api/auctions/seller/my
const getMyAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate('highestBidder', 'name')
      .populate('winner', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, auctions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  deleteAuction,
  getMyAuctions,
};
