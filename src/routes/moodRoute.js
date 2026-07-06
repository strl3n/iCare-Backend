const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  saveMood,
  getMoodHistory,
  getMoodStats,
  deleteMood,
} = require("../controllers/moodController");
const auth = require("../middlewares/auth");

// @route   POST /api/mood
router.post(
  "/",
  auth,
  [
    body("moodLevel")
      .isInt({ min: 1, max: 10 })
      .withMessage("Mood level harus antara 1-10"),
    body("note")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Catatan maksimal 500 karakter"),
  ],
  saveMood
);

// @route   GET /api/mood/history
router.get("/history", auth, getMoodHistory);

// @route   GET /api/mood/stats
router.get("/stats", auth, getMoodStats);

// @route   DELETE /api/mood/:id
router.delete("/:id", auth, deleteMood);

module.exports = router;