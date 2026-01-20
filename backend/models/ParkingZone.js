const mongoose = require('mongoose');

const parkingZoneSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    description: {
        type: String,
    },
    photos: [String], // Array of URLs
    services: {
        cctv: { type: Boolean, default: false },
        evCharging: { type: Boolean, default: false },
        valet: { type: Boolean, default: false },
        covered: { type: Boolean, default: false },
        restroom: { type: Boolean, default: false },
    },
    workingHours: {
        open: String, // "09:00"
        close: String, // "22:00"
    },
    hourlyRate: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isApproved: {
        type: Boolean,
        default: false, // Requires Admin Approval
    },
}, {
    timestamps: true,
});

// Create index for geospatial queries
parkingZoneSchema.index({ location: '2dsphere' });

const ParkingZone = mongoose.model('ParkingZone', parkingZoneSchema);

module.exports = ParkingZone;
