const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ==================== ROUTES ====================
app.use("/api/auth", require("./src/routes/authRoute"));
app.use("/api/mood", require("./src/routes/moodRoute"));

// ==================== QUOTE ====================
app.get("/api/quote", async (req, res) => {
  // ... (sama seperti sebelumnya)
  res.json({ success: true, data: { quote: "Test", author: "iCare" } });
});

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "iCare API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ==================== 404 ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.url} tidak ditemukan`,
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  console.error("🔥 Stack:", err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    error: err.message, // ← Tambahkan ini untuk debugging
  });
});

// ==================== EXPORT UNTUK VERCEL ====================
module.exports = app;

// ==================== START (hanya jika dijalankan langsung) ====================
if (require.main === module) {
  const connectDB = require("./config/database");
  
  connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Health: http://localhost:${PORT}/health`);
    });
  }).catch(err => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
}