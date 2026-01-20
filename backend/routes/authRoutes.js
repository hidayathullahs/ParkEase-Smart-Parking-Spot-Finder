const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, updateProfile, getMe, forgotPassword, resetPassword, toggleFavorite } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/profile', protect, updateProfile);
router.put('/favorite/:id', protect, toggleFavorite);
router.get('/me', protect, getMe);

module.exports = router;
