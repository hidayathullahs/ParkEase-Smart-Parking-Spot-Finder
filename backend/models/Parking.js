const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    images: [String],
    ownership: {
        type: String,
        enum: ['SELF', 'FATHER', 'GUARDIAN', 'WIFE', 'SON', 'OTHER'],
        required: true
    },
    timings: {
        from: String, // "08:00"
        to: String    // "20:00"
    },
    hourlyRate: {
        type: Number,
        required: true
    },
    dimensions: {
        width: Number, // in meters or feet
        height: Number,
        totalArea: Number // optional if width/height provided, but good for irregular shapes
    },
    capacity: {
        c4_seater: { type: Number, default: 0 },
        c6_seater: { type: Number, default: 0 },
        suv: { type: Number, default: 0 },
        bike: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    rejectionReason: {
        type: String
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

parkingSchema.index({ location: '2dsphere' });

const Parking = mongoose.model('Parking', parkingSchema);

module.exports = Parking;
