const express = require('express');
const { protect, checkRole } = require('../middlewares/authMiddleware');
const {
    createParkingListing,
    getMyParkingListings,
    updateParkingListing,
    getProviderStats
} = require('../controllers/providerController');

const router = express.Router();

router.use(protect);
router.use(checkRole('PROVIDER'));

router.get('/stats', getProviderStats);
router.post('/parkings', createParkingListing);
router.get('/parkings', getMyParkingListings);
router.put('/parkings/:id', updateParkingListing);

module.exports = router;
