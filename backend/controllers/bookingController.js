const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const Booking = require("../models/Booking");
const ParkingListing = require("../models/ParkingListing");

// overlap condition: (start < existingEnd) && (end > existingStart)
const overlapQuery = (parkingId, startTime, endTime) => ({
    parkingId,
    status: { $in: ["BOOKED", "CHECKED_IN"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
});

const getCapacity = (parking, vehicleType) => {
    // Use vehicleCapacity first; fallback approxTotalCars
    const cap = parking.vehicleCapacity || {};
    if (vehicleType === "TWO_WHEELER") return cap.twoWheeler ?? 0;
    if (vehicleType === "FOUR_SEATER") return cap.car4Seater ?? cap.fourWheeler ?? parking.approxTotalCars;
    if (vehicleType === "SIX_SEATER") return cap.car6Seater ?? parking.approxTotalCars;
    if (vehicleType === "SUV") return cap.suv ?? parking.approxTotalCars;
    return parking.approxTotalCars || 0;
};

exports.createBooking = async (req, res) => {
    try {
        const { parkingId, startTime, endTime, vehicleType } = req.body;

        if (!parkingId || !startTime || !endTime || !vehicleType) {
            return res.status(400).json({ message: "Missing booking details" });
        }

        const parking = await ParkingListing.findById(parkingId);
        if (!parking) return res.status(404).json({ message: "Parking not found" });
        if (parking.status !== "APPROVED") return res.status(403).json({ message: "Parking not approved" });

        const start = new Date(startTime);
        const end = new Date(endTime);
        if (!(start < end)) {
            return res.status(400).json({ message: "Invalid time range" });
        }

        const totalHours = Math.ceil((end - start) / (1000 * 60 * 60));
        const hourlyRate = parking.pricing?.hourlyRate || 0;
        const totalAmount = totalHours * hourlyRate;

        // capacity check
        const capacity = getCapacity(parking, vehicleType);
        if (capacity <= 0) {
            return res.status(400).json({ message: "No capacity available for this vehicle type" });
        }

        // count overlapping bookings
        const overlappingCount = await Booking.countDocuments(overlapQuery(parkingId, start, end));

        if (overlappingCount >= capacity) {
            return res.status(409).json({ message: "No slots available for selected time" });
        }

        const bookingId = "PE-" + uuidv4().slice(0, 8).toUpperCase();

        const qrPayload = JSON.stringify({
            bookingId,
            parkingId,
            userId: req.user.id,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

        const booking = await Booking.create({
            bookingId,
            userId: req.user.id,
            parkingId,
            vehicleType,
            startTime: start,
            endTime: end,
            totalHours,
            totalAmount,
            status: "BOOKED",
            qrCodeDataUrl,
        });

        res.status(201).json({ message: "Booking successful", booking });
    } catch (err) {
        console.error("createBooking error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyActiveBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            userId: req.user.id,
            status: { $in: ["BOOKED", "CHECKED_IN"] },
        })
            .populate("parkingId", "title addressLine city location pricing images")
            .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyHistoryBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            userId: req.user.id,
            status: { $in: ["CHECKED_OUT", "CANCELLED", "EXPIRED"] },
        })
            .populate("parkingId", "title addressLine city location pricing images")
            .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== "BOOKED") {
            return res.status(400).json({ message: "Cannot cancel this booking" });
        }

        booking.status = "CANCELLED";
        await booking.save();

        res.json({ message: "Booking cancelled", booking });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.extendBooking = async (req, res) => {
    try {
        const { extraHours } = req.body;

        if (!extraHours || extraHours <= 0) {
            return res.status(400).json({ message: "extraHours is required" });
        }

        const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status !== "BOOKED" && booking.status !== "CHECKED_IN") {
            return res.status(400).json({ message: "Booking cannot be extended" });
        }

        // Prevent extending after expired time
        if (new Date() > new Date(booking.endTime)) {
            booking.status = "EXPIRED";
            await booking.save();
            return res.status(400).json({ message: "Booking already expired" });
        }

        const parking = await ParkingListing.findById(booking.parkingId);
        if (!parking) return res.status(404).json({ message: "Parking not found" });

        const oldEnd = new Date(booking.endTime);
        const newEnd = new Date(oldEnd.getTime() + extraHours * 60 * 60 * 1000);

        // Check overlap with other bookings for that extended interval
        const capacity = getCapacity(parking, booking.vehicleType);

        const overlapCount = await Booking.countDocuments({
            parkingId: booking.parkingId,
            status: { $in: ["BOOKED", "CHECKED_IN"] },
            _id: { $ne: booking._id },
            startTime: { $lt: newEnd },
            endTime: { $gt: booking.startTime },
        });

        if (overlapCount >= capacity) {
            return res.status(409).json({ message: "Cannot extend: slots full for extended time" });
        }

        const hourlyRate = parking.pricing?.hourlyRate || 0;
        const oldHours = booking.totalHours;

        booking.endTime = newEnd;
        booking.totalHours = oldHours + extraHours;
        booking.totalAmount = booking.totalHours * hourlyRate;

        await booking.save();

        res.json({ message: "Booking extended", booking });
    } catch (err) {
        console.error("extendBooking error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.checkInUser = async (req, res) => {
    try {
        // Search by bookingId (from QR) OR _id (standard)
        // If req.params.id looks like UUID/Custom ID (e.g. PE-...), search bookingId
        // else try _id
        const isCustomId = req.params.id.startsWith("PE-");
        const query = isCustomId ? { bookingId: req.params.id } : { _id: req.params.id };

        const booking = await Booking.findOne(query);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Verify Ownership (Security Check)
        if (req.user.role === "PROVIDER") {
            const parking = await ParkingListing.findById(booking.parkingId);
            if (!parking) return res.status(404).json({ message: "Parking lot not found" });

            if (parking.ownerId.toString() !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized: You do not own this parking spot" });
            }
        }

        if (booking.status === "CHECKED_IN") {
            return res.status(400).json({ message: "Booking already checked in" });
        }

        if (booking.status !== "BOOKED") {
            return res.status(400).json({ message: "Invalid booking status for check-in" });
        }

        booking.status = "CHECKED_IN";
        booking.actualStartTime = new Date();
        await booking.save();

        res.json({ message: "Check-in successful", booking });
    } catch (err) {
        console.error("checkInUser error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.checkOutUser = async (req, res) => {
    try {
        const isCustomId = req.params.id.startsWith("PE-");
        const query = isCustomId ? { bookingId: req.params.id } : { _id: req.params.id };

        const booking = await Booking.findOne(query);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // Verify Ownership (Security Check)
        if (req.user.role === "PROVIDER") {
            const parking = await ParkingListing.findById(booking.parkingId);
            if (!parking) return res.status(404).json({ message: "Parking lot not found" });

            if (parking.ownerId.toString() !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized: You do not own this parking spot" });
            }
        }

        if (booking.status === "COMPLETED" || booking.status === "CHECKED_OUT") {
            return res.status(400).json({ message: "Booking already completed" });
        }

        if (booking.status !== "CHECKED_IN") {
            return res.status(400).json({ message: "Booking must be checked-in first" });
        }

        booking.status = "COMPLETED";
        booking.actualEndTime = new Date();
        await booking.save();

        res.json({ message: "Check-out successful", booking });
    } catch (err) {
        console.error("checkOutUser error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
