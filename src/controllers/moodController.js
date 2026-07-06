const Mood = require("../models/Mood");
const mongoose = require("mongoose");

// @desc    Save Mood
// @route   POST /api/mood
// @access  Private
exports.saveMood = async (req, res) => {
  try {
    const { moodLevel, note, date } = req.body;
    const userId = req.userId;

    // Validasi
    if (!moodLevel || moodLevel < 1 || moodLevel > 10) {
      return res.status(400).json({
        success: false,
        message: "Mood level harus antara 1-10",
      });
    }

    const mood = await Mood.create({
      userId,
      moodLevel,
      note: note || null,
      date: date || new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Mood berhasil disimpan!",
      data: {
        _id: mood._id.toString(),
        userId: mood.userId.toString(),
        moodLevel: mood.moodLevel,
        note: mood.note,
        date: mood.date.toISOString(),
      },
    });
  } catch (error) {
    console.error("Save mood error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

// @desc    Get Mood History
// @route   GET /api/mood/history
// @access  Private
exports.getMoodHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { filter, limit = 50 } = req.query;

    let query = { userId };
    const now = new Date();

    // Filter berdasarkan waktu
    if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.date = { $gte: weekAgo };
    } else if (filter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query.date = { $gte: monthAgo };
    }

    const moods = await Mood.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Format response
    const formattedMoods = moods.map((mood) => ({
      _id: mood._id.toString(),
      userId: mood.userId.toString(),
      moodLevel: mood.moodLevel,
      note: mood.note,
      date: mood.date.toISOString(),
    }));

    res.json({
      success: true,
      count: formattedMoods.length,
      data: formattedMoods,
    });
  } catch (error) {
    console.error("Get mood history error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

// @desc    Get Mood Stats
// @route   GET /api/mood/stats
// @access  Private
exports.getMoodStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all moods
    const moods = await Mood.find({ userId }).sort({ date: -1 });

    if (moods.length === 0) {
      return res.json({
        success: true,
        data: {
          totalEntries: 0,
          averageMood: 0,
          highestMood: 0,
          lowestMood: 0,
          weeklyAverage: 0,
          latestMood: null,
        },
      });
    }

    // Calculate stats
    const totalEntries = moods.length;
    const totalMood = moods.reduce((sum, m) => sum + m.moodLevel, 0);
    const averageMood = totalMood / totalEntries;
    const highestMood = Math.max(...moods.map((m) => m.moodLevel));
    const lowestMood = Math.min(...moods.map((m) => m.moodLevel));
    const latestMood = moods[0];

    // Calculate weekly average
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekMoods = moods.filter((m) => new Date(m.date) >= weekAgo);
    const weeklyAverage =
      weekMoods.length > 0
        ? weekMoods.reduce((sum, m) => sum + m.moodLevel, 0) / weekMoods.length
        : 0;

    res.json({
      success: true,
      data: {
        totalEntries,
        averageMood: Math.round(averageMood * 10) / 10,
        highestMood,
        lowestMood,
        weeklyAverage: Math.round(weeklyAverage * 10) / 10,
        latestMood: latestMood
          ? {
              _id: latestMood._id.toString(),
              userId: latestMood.userId.toString(),
              moodLevel: latestMood.moodLevel,
              note: latestMood.note,
              date: latestMood.date.toISOString(),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get mood stats error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

// @desc    Delete Mood
// @route   DELETE /api/mood/:id
// @access  Private
exports.deleteMood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID tidak valid",
      });
    }

    const mood = await Mood.findOne({ _id: id, userId });

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: "Mood tidak ditemukan",
      });
    }

    await mood.deleteOne();

    res.json({
      success: true,
      message: "Mood berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete mood error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};