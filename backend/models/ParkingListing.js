const mongoose = require('mongoose');

const parkingListingSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Basic Info
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },

    // Ownership relationship
    ownershipRelation: {
        type: String,
        enum: ["SELF", "FATHER", "MOTHER", "GUARDIAN", "WIFE", "SON", "OTHER"],
        required: true,
    },

    // Location
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },

    // Time availability (24h format, e.g., "08:00")
    availableFrom: { type: String, required: true },
    availableTo: { type: String, required: true },

    // Dimensions (in meters)
    dimensions: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        totalArea: { type: Number, required: true }, // Auto-calculated
    },

    // Parking capacity (Auto-calculated)
    approxTotalCars: { type: Number, required: true },

    // Vehicle based capacity (Auto-calculated breakdown)
    vehicleCapacity: {
        twoWheeler: { type: Number, default: 0 },
        fourWheeler: { type: Number, default: 0 },
        car4Seater: { type: Number, default: 0 },
        car6Seater: { type: Number, default: 0 },
        suv: { type: Number, default: 0 },
    },

    // Pricing
    pricing: {
        hourlyRate: { type: Number, required: true },
    },

    // Images (URLs)
    images: [{ type: String, required: true }],

    // Approval workflow
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    rejectionReason: { type: String, default: "" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
}, {
    timestamps: true
});

const ParkingListing = mongoose.model('ParkingListing', parkingListingSchema);

module.exports = ParkingListing;
