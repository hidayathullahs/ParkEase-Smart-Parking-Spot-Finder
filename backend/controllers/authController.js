const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Client initialized inside handler to ensure env vars are loaded

// Generate JWT Helper
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'USER', // Default to USER
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    const { token } = req.body;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
            // Optional: Update googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                favorites: user.favorites || [],
                transactions: user.transactions || [],
                token: generateToken(user._id),
            });
        } else {
            // Create new user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                name,
                email,
                password: randomPassword,
                photo: picture,
                role: 'USER',
                googleId: googleId, // Store Google ID
                favorites: [],
                transactions: []
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                favorites: user.favorites,
                transactions: user.transactions,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        console.error("Google Login Error:", error.message);
        res.status(400).json({ message: `Google Sign-In failed: ${error.message}` });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.licensePlate = req.body.licensePlate || user.licensePlate;
            if (req.body.password) {
                user.password = req.body.password;
            }
            // Simple logic to add a new card if provided
            if (req.body.newCard) {
                user.paymentMethods.push(req.body.newCard);
            }

            // Garage: update entire array or pushing single is handled by frontend sending whole array usually,
            // but for simplicity let's allow pushing a new vehicle or replacing list
            if (req.body.vehicles) {
                user.vehicles = req.body.vehicles;
            }

            // Wallet: Add funds
            // Wallet: Add funds & Record Transaction
            if (req.body.addFunds) {
                const amount = Number(req.body.addFunds);
                user.walletBalance = (user.walletBalance || 0) + amount;
                user.transactions.push({
                    type: 'credit',
                    amount: amount,
                    desc: 'Added to wallet',
                    date: new Date()
                });
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                licensePlate: updatedUser.licensePlate,
                roles: updatedUser.roles,
                paymentMethods: updatedUser.paymentMethods,
                vehicles: updatedUser.vehicles,
                walletBalance: updatedUser.walletBalance,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile (Me)
// @route   GET /api/auth/me
// @access  Private
// @desc    Get user profile (Me)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites');
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                licensePlate: user.licensePlate,
                walletBalance: user.walletBalance,
                photo: user.photo,
                favorites: user.favorites || [],
                transactions: user.transactions || []
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Toggle Favorite Parking
// @route   PUT /api/auth/favorite/:id
// @access  Private
const toggleFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const parkingId = req.params.id;

        // Ensure favorites array exists
        if (!user.favorites) user.favorites = [];

        if (user.favorites.includes(parkingId)) {
            user.favorites = user.favorites.filter(id => id.toString() !== parkingId);
        } else {
            user.favorites.push(parkingId);
        }

        await user.save();

        // Return updated favorites list with populated data if possible or just IDs
        // Ideally populate to keep frontend in sync
        const updatedUser = await User.findById(req.user._id).populate('favorites');
        res.json(updatedUser.favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
    <h1>You requested a password reset</h1>
    <p>Please go to this link to reset your password:</p>
    <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    <p>This link expires in 15 minutes.</p>
  `;

    try {
        await sendEmail({
            to: user.email,
            subject: "ParkEase - Password Reset",
            html: message,
        });

        res.json({ message: "Password reset link sent to email" });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500).json({ message: "Email could not be sent" });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password; // Pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
};

module.exports = { registerUser, loginUser, googleLogin, updateProfile, getMe, forgotPassword, resetPassword, toggleFavorite };
