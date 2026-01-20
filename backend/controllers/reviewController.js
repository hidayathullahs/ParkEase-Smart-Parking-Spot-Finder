const Review = require('../models/Review');
const Parking = require('../models/Parking');
const Booking = require('../models/Booking');

// @desc    Get reviews for a parking
// @route   GET /api/reviews/:parkingId
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ parking: req.params.parkingId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    const { parkingId, rating, comment } = req.body;

    try {
        const parking = await Parking.findById(parkingId);
        if (!parking) return res.status(404).json({ message: 'Parking not found' });

        // Lock Rule: Check if user has a COMPLETED booking for this parking
        const hasCompletedBooking = await Booking.findOne({
            userId: req.user._id,
            parkingId: parkingId,
            status: { $in: ['COMPLETED', 'CHECKED_OUT'] }
        });

        if (!hasCompletedBooking) {
            return res.status(403).json({
                message: 'You can only review after completing a booking at this parking.'
            });
        }

        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            parking: parkingId
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this parking' });
        }

        const review = await Review.create({
            user: req.user._id,
            parking: parkingId,
            rating: Number(rating),
            comment
        });

        // Update Average Rating
        const reviews = await Review.find({ parking: parkingId });
        parking.numReviews = reviews.length;
        parking.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await parking.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getReviews, createReview };
