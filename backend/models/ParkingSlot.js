const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    parkingZone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingZone',
        required: true,
    },
    slotNumber: {
        type: String, // e.g., "A1", "B2"
        required: true,
    },
    type: {
        type: String,
        enum: ['Car', 'Bike', 'EV', 'VIP'],
        default: 'Car',
    },
    isOccupied: {
        type: Boolean,
        default: false,
    },
    isMaintenance: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Composite index to ensure unique slot number per zone
parkingSlotSchema.index({ parkingZone: 1, slotNumber: 1 }, { unique: true });

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

module.exports = ParkingSlot;
