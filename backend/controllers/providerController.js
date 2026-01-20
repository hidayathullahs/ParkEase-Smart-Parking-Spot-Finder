const ParkingListing = require('../models/ParkingListing');

// Auto calculation logic
const calcCapacities = ({ length, width }) => {
    const totalArea = length * width;

    // rough approximation (12 sqm per car)
    const approxTotalCars = Math.max(1, Math.floor(totalArea / 12));

    return {
        totalArea,
        approxTotalCars,
        vehicleCapacity: {
            twoWheeler: Math.floor(totalArea / 2),
            fourWheeler: approxTotalCars,
            car4Seater: approxTotalCars,
            car6Seater: Math.max(1, Math.floor(approxTotalCars * 0.7)),
            suv: Math.max(1, Math.floor(approxTotalCars * 0.5)),
        },
    };
};

const createParkingListing = async (req, res) => {
    try {
        const {
            title,
            description,
            ownershipRelation,
            addressLine,
            city,
            pincode,
            location,
            availableFrom,
            availableTo,
            dimensions,
            pricing,
            images,
        } = req.body;

        const { totalArea, approxTotalCars, vehicleCapacity } = calcCapacities(dimensions);

        const listing = await ParkingListing.create({
            providerId: req.user._id,
            title,
            description,
            ownershipRelation,
            addressLine,
            city,
            pincode,
            location,
            availableFrom,
            availableTo,
            dimensions: { ...dimensions, totalArea },
            approxTotalCars,
            vehicleCapacity,
            pricing,
            images,
            status: "PENDING",
        });

        res.status(201).json({ message: "Submitted for approval", listing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyParkingListings = async (req, res) => {
    try {
        const list = await ParkingListing.find({ providerId: req.user._id }).sort({ createdAt: -1 });
        res.json({ list });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateParkingListing = async (req, res) => {
    try {
        const listing = await ParkingListing.findOne({
            _id: req.params.id,
            providerId: req.user._id,
        });

        if (!listing) return res.status(404).json({ message: "Not found" });

        // Merge updates
        Object.assign(listing, req.body);

        // Recalculate if dimensions change
        if (req.body.dimensions?.length && req.body.dimensions?.width) {
            const { totalArea, approxTotalCars, vehicleCapacity } = calcCapacities(req.body.dimensions);
            listing.dimensions.totalArea = totalArea;
            listing.approxTotalCars = approxTotalCars;
            listing.vehicleCapacity = vehicleCapacity;
        }

        // Reset status to PENDING on update
        listing.status = "PENDING";
        listing.rejectionReason = "";

        await listing.save();
        res.json({ message: "Updated & resubmitted for approval", listing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Booking = require('../models/Booking');

const getProviderStats = async (req, res) => {
    try {
        const providerId = req.user._id;

        // Find all parkings owned by this provider
        const parkings = await ParkingListing.find({ providerId });
        const parkingIds = parkings.map(p => p._id);

        const totalSpots = parkings.length;

        // Active Bookings (CHECKED_IN)
        const activeBookings = await Booking.countDocuments({
            parkingId: { $in: parkingIds },
            status: 'CHECKED_IN'
        });

        // Today's Earnings (Completed bookings today)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayEarningsAgg = await Booking.aggregate([
            {
                $match: {
                    parkingId: { $in: parkingIds },
                    status: { $in: ['COMPLETED', 'CHECKED_OUT'] },
                    updatedAt: { $gte: startOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);
        const todayEarnings = todayEarningsAgg[0]?.total || 0;

        // Monthly Earnings (naive: last 30 days)
        const startOfMonth = new Date();
        startOfMonth.setDate(startOfMonth.getDate() - 30); // Last 30 days

        const monthlyEarningsAgg = await Booking.aggregate([
            {
                $match: {
                    parkingId: { $in: parkingIds },
                    status: { $in: ['COMPLETED', 'CHECKED_OUT'] },
                    updatedAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);
        const monthlyEarnings = monthlyEarningsAgg[0]?.total || 0;

        res.json({
            totalSpots,
            activeBookings,
            todayEarnings,
            monthlyEarnings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createParkingListing,
    getMyParkingListings,
    updateParkingListing,
    getProviderStats
};
