const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios"); // ⬅️ BARU: dibutuhkan untuk manggil RapidAPI

dotenv.config();
const connectDB = require("./config/database");
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

// ==================== QUOTE ====================
// Manggil RapidAPI beneran (pakai RAPIDAPI_KEY dari env), bukan hardcoded lagi.
//
// API yang dipakai: "Quotes15" di RapidAPI. Kalau API RapidAPI kamu BEDA,
// cukup sesuaikan RAPIDAPI_HOST, URL, dan cara ambil field quote/author
// di bagian yang ditandai di bawah.
app.get("/api/quote", async (req, res) => {
  const RAPIDAPI_HOST = "quotes15.p.rapidapi.com";

  try {
    // Filter tag yang positif/menenangkan — sesuai tema aplikasi pencegahan
    // bunuh diri (SDG 3.2.4), supaya quote yang muncul tidak berpotensi sedih/berat.
    const positiveTags = ["happiness", "life", "inspirational", "motivational", "hope"];
    const randomTag = positiveTags[Math.floor(Math.random() * positiveTags.length)];

    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/quotes/random/`,
      {
        params: { tag: randomTag, language_code: "en" },
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
        timeout: 8000,
      }
    );

    // ⬇️ Sesuaikan mapping ini kalau struktur JSON API-mu beda.
    // Quotes15 mengembalikan: { content: "...", originator: { name: "..." } }
    const quoteText = response.data?.content;
    const author = response.data?.originator?.name || "Unknown";

    if (!quoteText) {
      throw new Error("Response RapidAPI tidak berisi quote");
    }

    res.json({
      success: true,
      data: { quote: quoteText, author },
    });
  } catch (error) {
    console.error("❌ Gagal ambil quote dari RapidAPI:", error.message);

    // Fallback quote positif kalau RapidAPI gagal/timeout/quota habis,
    // supaya endpoint tetap selalu mengembalikan sesuatu yang baik untuk ditampilkan.
    const fallbackQuotes = [
      { quote: "Kamu lebih kuat dari yang kamu kira, dan hari ini adalah awal yang baru.", author: "iCare" },
      { quote: "Setiap badai pasti berlalu. Kamu tidak sendirian.", author: "iCare" },
      { quote: "Hidupmu berharga, dan dunia ini lebih baik dengan kehadiranmu.", author: "iCare" },
    ];
    const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];

    res.json({
      success: true,
      data: fallback,
    });
  }
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