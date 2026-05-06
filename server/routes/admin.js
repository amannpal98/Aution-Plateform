const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, updateUser, deleteUser,
  getAllAuctions, featureAuction,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(protect, roleCheck('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/auctions', getAllAuctions);
router.put('/auctions/:id/feature', featureAuction);

module.exports = router;
