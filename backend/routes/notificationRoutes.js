const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/", protect, notificationController.getMyNotifications);
router.get("/unread-count", protect, notificationController.getUnreadCount);
router.put("/:id/read", protect, notificationController.markAsRead);
router.put("/read-all", protect, notificationController.markAllRead);

module.exports = router;
