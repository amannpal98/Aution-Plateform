const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// @desc    Get platform stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalAuctions, totalBids, activeAuctions, endedAuctions] =
      await Promise.all([
        User.countDocuments(),
        Auction.countDocuments(),
        Bid.countDocuments(),
        Auction.countDocuments({ status: 'active' }),
        Auction.countDocuments({ status: 'ended' }),
      ]);

    // Revenue approximation: sum of winning bids
    const revenueData = await Auction.aggregate([
      { $match: { status: 'ended', currentBid: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$currentBid' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Recent auctions
    const recentAuctions = await Auction.find()
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Category breakdown
    const categoryBreakdown = await Auction.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAuctions,
        totalBids,
        activeAuctions,
        endedAuctions,
        totalRevenue,
        recentAuctions,
        recentUsers,
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (role, status)
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot modify your own account' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all auctions for admin
// @route   GET /api/admin/auctions
const getAllAuctions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const total = await Auction.countDocuments(query);
    const auctions = await Auction.find(query)
      .populate('seller', 'name email')
      .populate('winner', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, auctions, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Feature/unfeature auction
// @route   PUT /api/admin/auctions/:id/feature
const featureAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    auction.featured = !auction.featured;
    await auction.save();

    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getUsers, updateUser, deleteUser, getAllAuctions, featureAuction };
