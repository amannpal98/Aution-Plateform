const express = require('express');
const router = express.Router();
const { placeBid, getAuctionBids, getUserBids, getWonAuctions } = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

router.post('/', protect, placeBid);
router.get('/user/history', protect, getUserBids);
router.get('/user/won', protect, getWonAuctions);
router.get('/:auctionId', getAuctionBids);

module.exports = router;
