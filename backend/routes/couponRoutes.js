const express = require('express');
const router = express.Router();
const { createCoupon, validateCoupon, getCoupons } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, createCoupon).get(protect, getCoupons);
router.post('/validate', validateCoupon);

module.exports = router;
