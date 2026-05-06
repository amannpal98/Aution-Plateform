const Auction = require('../models/Auction');
const User = require('../models/User');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join auction room
    socket.on('join_auction', (auctionId) => {
      socket.join(auctionId);
      console.log(`📦 ${socket.id} joined auction: ${auctionId}`);
      socket.emit('joined_auction', { auctionId, message: 'Joined auction room' });
    });

    // Leave auction room
    socket.on('leave_auction', (auctionId) => {
      socket.leave(auctionId);
      console.log(`📤 ${socket.id} left auction: ${auctionId}`);
    });

    // Auction timer check - client can request time remaining
    socket.on('check_auction', async (auctionId) => {
      try {
        const auction = await Auction.findById(auctionId).select('endTime status currentBid');
        if (auction) {
          socket.emit('auction_status', {
            auctionId,
            timeLeft: new Date(auction.endTime) - new Date(),
            status: auction.status,
            currentBid: auction.currentBid,
          });
        }
      } catch (err) {
        socket.emit('error', { message: 'Could not fetch auction status' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  // Background job: auto-end expired auctions every 30 seconds
  setInterval(async () => {
    try {
      const expiredAuctions = await Auction.find({
        status: 'active',
        endTime: { $lte: new Date() },
      }).populate('highestBidder', 'name email');

      for (const auction of expiredAuctions) {
        auction.status = 'ended';

        if (auction.highestBidder) {
          auction.winner = auction.highestBidder._id;

          // Add notification to winner
          await User.findByIdAndUpdate(auction.highestBidder._id, {
            $push: {
              notifications: {
                message: `🎉 You won the auction: "${auction.title}" with a bid of $${auction.currentBid}!`,
              },
            },
          });
        }

        await auction.save();

        // Notify room
        io.to(auction._id.toString()).emit('auction_ended', {
          auctionId: auction._id,
          winner: auction.highestBidder,
          finalBid: auction.currentBid,
          message: auction.highestBidder
            ? `Auction ended! Winner: ${auction.highestBidder.name}`
            : 'Auction ended with no bids.',
        });

        console.log(`⏰ Auction ended: ${auction.title}`);
      }
    } catch (err) {
      console.error('Socket timer error:', err.message);
    }
  }, 30000);
};

module.exports = { initSocket };
