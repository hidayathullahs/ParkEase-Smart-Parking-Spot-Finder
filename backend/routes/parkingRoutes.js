const express = require('express');
const router = express.Router();
const ParkingListing = require('../models/ParkingListing');

// Public route to get all approved parkings for the Finder map
router.get('/', async (req, res) => {
    try {
        const parkings = await ParkingListing.find({ status: "APPROVED" });
        res.json(parkings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single parking details
router.get('/:id', async (req, res) => {
    try {
        const parking = await ParkingListing.findById(req.params.id).populate('providerId', 'name email');
        if (parking && parking.status === 'APPROVED') {
            res.json(parking);
        } else {
            res.status(404).json({ message: "Parking not found or not approved" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
