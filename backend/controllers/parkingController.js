const Parking = require('../models/Parking');

// @desc    Create a new parking spot
// @route   POST /api/provider/parkings
// @access  Private (Provider)
const createParking = async (req, res) => {
    try {
        const {
            name, address, city, latitude, longitude,
            images, ownership, timings, hourlyRate,
            dimensions, // { width, height, totalArea }
        } = req.body;

        // Auto-calculate capacity if not provided (Basic estimation logic)
        // Assume standard car slot is ~12.5 sq meter (2.5m x 5m)
        // 4-seater: 12.5sqm, 6-seater: 15sqm, SUV: 18sqm
        // This is a rough estimation as requested.
        let totalArea = dimensions?.totalArea;
        if (!totalArea && dimensions?.width && dimensions?.height) {
            totalArea = dimensions.width * dimensions.height;
        }

        // Logic from spec:
        // 4-seater -> example 3 cars
        // 6-seater -> example 2 cars
        // SUV -> example 1-2 cars
        // We will just store the max potential for each type for now.
        // OR we can allocate specific slots. The spec says "approximate slots for different car sizes".
        // Let's implement a simple ratio based on area.

        let capacity = { c4_seater: 0, c6_seater: 0, suv: 0, bike: 0 };

        if (totalArea) {
            // Rough estimation logic
            capacity.c4_seater = Math.floor(totalArea / 12);
            capacity.c6_seater = Math.floor(totalArea / 15);
            capacity.suv = Math.floor(totalArea / 18);
            capacity.bike = Math.floor(totalArea / 3);
        }

        // Override if user provided specific capacity manual (optional)
        if (req.body.capacity) {
            capacity = req.body.capacity;
        }

        const parking = new Parking({
            provider: req.user._id,
            name,
            address,
            city,
            location: {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)]
            },
            images: images || [],
            ownership,
            timings,
            hourlyRate,
            dimensions,
            capacity,
            status: 'PENDING'
        });

        const createdParking = await parking.save();
        res.status(201).json(createdParking);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider's parkings
// @route   GET /api/provider/parkings
// @access  Private (Provider)
const getProviderParkings = async (req, res) => {
    try {
        const parkings = await Parking.find({ provider: req.user._id });
        res.json(parkings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update parking
// @route   PUT /api/provider/parkings/:id
// @access  Private (Provider)
// Logic: If rejected, they can edit and it becomes PENDING again
const updateParking = async (req, res) => {
    try {
        const parking = await Parking.findById(req.params.id);

        if (!parking) {
            return res.status(404).json({ message: 'Parking not found' });
        }

        if (parking.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields
        // If status was REJECTED, reset to PENDING on update
        if (parking.status === 'REJECTED') {
            parking.status = 'PENDING';
            parking.rejectionReason = undefined;
        }

        Object.assign(parking, req.body);

        // Recalculate capacity if dimensions changed? (Skipping for simplicity unless explicitly asked)

        const updatedParking = await parking.save();
        res.json(updatedParking);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all parkings (Public/User - Approved only)
// @route   GET /api/parkings
// @access  Public
const getApprovedParkings = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        } : {};

        const parkings = await Parking.find({ ...keyword, status: 'APPROVED' });
        res.json(parkings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single parking by ID
// @route   GET /api/parkings/:id
// @access  Public
const getParkingById = async (req, res) => {
    try {
        const parking = await Parking.findById(req.params.id).populate('provider', 'name email');

        if (parking) {
            res.json(parking);
        } else {
            res.status(404).json({ message: 'Parking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createParking, getProviderParkings, updateParking, getApprovedParkings, getParkingById };
