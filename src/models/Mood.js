const mongoose = require("mongoose");

const MoodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID wajib diisi"],
    },
    moodLevel: {
      type: Number,
      required: [true, "Mood level wajib diisi"],
      min: [1, "Mood level minimal 1"],
      max: [10, "Mood level maksimal 10"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Catatan maksimal 500 karakter"],
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk query cepat
MoodSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Mood", MoodSchema);
