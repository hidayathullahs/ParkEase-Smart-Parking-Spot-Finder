const express = require('express');
const { protect, checkRole } = require('../middlewares/authMiddleware');
const {
    getPendingParkings,
    approveParking,
    rejectParking,
    getStats
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.use(checkRole('ADMIN'));

router.get('/stats', getStats);
router.get('/parkings/pending', getPendingParkings);
router.put('/parkings/:id/approve', approveParking);
router.put('/parkings/:id/reject', rejectParking);
router.get('/users', require('../controllers/adminController').getUsers);
router.delete('/users/:id', require('../controllers/adminController').deleteUser);

module.exports = router;
