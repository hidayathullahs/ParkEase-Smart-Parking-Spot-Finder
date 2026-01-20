const express = require("express");
const router = express.Router();

const { protect, checkRole } = require("../middlewares/authMiddleware");
const bookingController = require("../controllers/bookingController");

router.post("/", protect, bookingController.createBooking);
router.get("/my", protect, bookingController.getMyActiveBookings);
router.get("/history", protect, bookingController.getMyHistoryBookings);
router.put("/:id/cancel", protect, bookingController.cancelBooking);
router.put("/:id/extend", protect, bookingController.extendBooking);

// Provider/Admin Actions
router.put("/:id/checkin", protect, checkRole("PROVIDER", "ADMIN"), bookingController.checkInUser);
router.put("/:id/checkout", protect, checkRole("PROVIDER", "ADMIN"), bookingController.checkOutUser);

module.exports = router;
