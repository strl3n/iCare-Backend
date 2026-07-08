const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose"); // ⬅️ tadinya belum di-require, dipakai di /health
dotenv.config();

const connectDB = require("./config/database"); // ⬅️ pindah ke atas, di luar if block

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ✅ WAJIB: pastikan DB connect sebelum route diproses (jalan di local maupun Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal koneksi ke database",
      error: err.message,
    });
  }
});

app.use("/api/auth", require("./src/routes/authRoute"));
app.use("/api/mood", require("./src/routes/moodRoute"));

app.get("/api/quote", async (req, res) => {
  res.json({ success: true, data: { quote: "Test", author: "iCare" } });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "iCare API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.url} tidak ditemukan`,
  });
});

app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    error: err.message,
  });
});

module.exports = app;

if (require.main === module) {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    });
}