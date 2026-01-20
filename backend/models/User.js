const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () { return !this.googleId; } // Password not required if using Google Auth
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    role: {
        type: String,
        enum: ['USER', 'PROVIDER', 'ADMIN'],
        default: 'USER',
        required: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    phone: {
        type: String,
        default: ''
    },
    licensePlate: {
        type: String,
        default: ''
    },
    vehicles: [{
        plate: String,
        model: String,
        type: { type: String, enum: ['4_SEATER', '6_SEATER', 'SUV', 'BIKE', 'OTHER'], default: '4_SEATER' },
        isDefault: { type: Boolean, default: false }
    }],
    walletBalance: {
        type: Number,
        default: 0
    },
    photo: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingListing'
    }],
    transactions: [{
        type: { type: String, enum: ['credit', 'debit'] },
        amount: Number,
        date: { type: Date, default: Date.now },
        desc: String
    }]
}, {
    timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    // Only hash password if it exists (skip for Google Auth users who might not have one initially)
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
