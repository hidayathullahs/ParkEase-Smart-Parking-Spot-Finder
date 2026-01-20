const ParkingListing = require('../models/ParkingListing');

const getPendingParkings = async (req, res) => {
    try {
        const list = await ParkingListing.find({ status: "PENDING" })
            .populate("providerId", "name email");
        res.json({ list });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveParking = async (req, res) => {
    try {
        const listing = await ParkingListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: "Not found" });

        listing.status = "APPROVED";
        listing.approvedBy = req.user._id;
        listing.approvedAt = new Date();
        listing.rejectionReason = "";
        await listing.save();

        res.json({ message: "Approved", listing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectParking = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ message: "Rejection reason required" });

        const listing = await ParkingListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: "Not found" });

        listing.status = "REJECTED";
        listing.rejectionReason = reason;
        await listing.save();

        res.json({ message: "Rejected", listing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add stats or other admin functions here if needed
const Booking = require('../models/Booking');
const User = require('../models/User');

const getStats = async (req, res) => {
    try {
        const totalParkings = await ParkingListing.countDocuments();
        const pendingApprovals = await ParkingListing.countDocuments({ status: "PENDING" });
        const activeParkings = await ParkingListing.countDocuments({ status: "APPROVED" });

        const totalUsers = await User.countDocuments({ role: "USER" });
        const totalProviders = await User.countDocuments({ role: "PROVIDER" });

        // Cars In (Checked In)
        const activeBookings = await Booking.countDocuments({ status: "CHECKED_IN" });

        // Total Bookings (History + Active)
        const totalBookings = await Booking.countDocuments();

        res.json({
            totalParkings,
            pendingApprovals,
            activeParkings,
            totalUsers,
            totalProviders,
            activeBookings, // Live Occupancy / Cars In
            totalBookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User Management
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete yourself" });
        }

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPendingParkings,
    approveParking,
    rejectParking,
    getStats,
    getUsers,
    deleteUser
};
