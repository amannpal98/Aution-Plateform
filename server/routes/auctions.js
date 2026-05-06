const express = require('express');
const router = express.Router();
const {
  getAuctions, getAuction, createAuction,
  updateAuction, deleteAuction, getMyAuctions,
} = require('../controllers/auctionController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', getAuctions);
router.get('/seller/my', protect, roleCheck('seller', 'admin'), getMyAuctions);
router.get('/:id', getAuction);
router.post('/', protect, roleCheck('seller', 'admin'), createAuction);
router.put('/:id', protect, roleCheck('seller', 'admin'), updateAuction);
router.delete('/:id', protect, roleCheck('seller', 'admin'), deleteAuction);

module.exports = router;
