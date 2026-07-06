const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (hanya di development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
  });
}

// ==================== ROUTES ====================
app.use("/api/auth", require("./src/routes/authRoute"));
app.use("/api/mood", require("./src/routes/moodRoute"));

// ==================== 3RD PARTY API - QUOTES (RapidAPI) ====================
app.get("/api/quote", async (req, res) => {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      console.warn("⚠️ RAPIDAPI_KEY tidak ditemukan di .env");
      return res.json({
        success: true,
        data: {
          quote: "Kesehatan mental bukanlah tujuan, tapi proses. Mari jaga kesehatan mental kita bersama.",
          author: "iCare",
        },
      });
    }

    const options = {
      method: "GET",
      url: "https://quotes-api12.p.rapidapi.com/dev-jokes",
      params: {
        category: "all",
        subcategory: "javascript",
      },
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "quotes-api12.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    };

    const response = await axios.request(options);

    if (response.data) {
      const quoteData = response.data;
      const quote = Array.isArray(quoteData) && quoteData.length > 0 ? quoteData[0] : quoteData;

      res.json({
        success: true,
        data: {
          quote: quote.text || quote.quote || quote.content || "Kesehatan mental adalah perjalanan, bukan tujuan.",
          author: quote.author || quote.originator?.name || "iCare",
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          quote: "Kesehatan mental bukanlah tujuan, tapi proses. Mari jaga kesehatan mental kita bersama.",
          author: "iCare",
        },
      });
    }
  } catch (error) {
    console.error("Quotes API error:", error.response?.data || error.message);

    const fallbackQuotes = [
      { quote: "Kesehatan mental bukanlah tujuan, tapi proses. Mari jaga kesehatan mental kita bersama.", author: "iCare" },
      { quote: "Setiap hari adalah kesempatan baru untuk menjadi lebih baik. Kamu berharga!", author: "iCare" },
      { quote: "Kamu lebih kuat dari yang kamu kira. Jangan pernah menyerah.", author: "iCare" },
      { quote: "Kebahagiaan sejati dimulai dari kesehatan mental yang baik.", author: "iCare" },
      { quote: "Kamu berharga dan berarti. Jangan pernah lupa itu.", author: "iCare" },
    ];

    const random = Math.floor(Math.random() * fallbackQuotes.length);
    res.json({
      success: true,
      data: fallbackQuotes[random],
    });
  }
});

// ==================== QUOTE INDONESIA (FALLBACK LOKAL) ====================
app.get("/api/quote/id", async (req, res) => {
  try {
    const quotesIndonesia = [
      { quote: "Kebahagiaan bukanlah tujuan akhir, melainkan perjalanan hidup.", author: "iCare" },
      { quote: "Setiap hari adalah kesempatan baru untuk menjadi lebih baik.", author: "iCare" },
      { quote: "Kamu lebih kuat dari yang kamu kira.", author: "iCare" },
      { quote: "Jangan pernah menyerah, karena ada banyak orang yang peduli padamu.", author: "iCare" },
      { quote: "Kesehatan mental adalah kunci kebahagiaan sejati.", author: "iCare" },
      { quote: "Kamu berharga dan berarti. Jangan pernah lupa itu.", author: "iCare" },
      { quote: "Kesedihan hari ini bukanlah akhir dari segalanya. Besok akan lebih baik.", author: "iCare" },
      { quote: "Meminta bantuan adalah tanda kekuatan, bukan kelemahan.", author: "iCare" },
      { quote: "Tidak ada yang salah dengan merasa sedih. Itu adalah bagian dari menjadi manusia.", author: "iCare" },
      { quote: "Kamu tidak sendiri. Ada banyak orang yang peduli dan siap membantu.", author: "iCare" },
    ];

    const random = Math.floor(Math.random() * quotesIndonesia.length);
    res.json({
      success: true,
      data: quotesIndonesia[random],
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        quote: "Kamu berharga dan berarti. Jangan pernah lupa itu.",
        author: "iCare",
      },
    });
  }
});

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "iCare API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      mood: "/api/mood",
      quote: "/api/quote (RapidAPI)",
      quote_id: "/api/quote/id (Indonesia)",
    },
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.url} tidak ditemukan`,
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

// ==================== EXPORT untuk Vercel ====================
module.exports = app;

// ==================== START SERVER (jika dijalankan langsung) ====================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  // ✅ Koneksi ke MongoDB hanya jika dijalankan langsung (bukan di Vercel)
  connectDB();
  
  app.listen(PORT, () => {
    console.log("=".repeat(50));
    console.log(`🚀 iCare API Server berjalan di port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📁 Health Check: http://localhost:${PORT}/health`);
    console.log("=".repeat(50));
    console.log("\n📋 Available Endpoints:");
    console.log(`  POST   /api/auth/register        - Registrasi user`);
    console.log(`  POST   /api/auth/login           - Login user`);
    console.log(`  POST   /api/auth/google          - Login dengan Google`);
    console.log(`  GET    /api/auth/me              - Get current user`);
    console.log(`  POST   /api/mood                 - Save mood`);
    console.log(`  GET    /api/mood/history         - Get mood history`);
    console.log(`  GET    /api/mood/stats           - Get mood stats`);
    console.log(`  DELETE /api/mood/:id             - Delete mood`);
    console.log(`  GET    /api/quote                - Random quote (RapidAPI)`);
    console.log(`  GET    /api/quote/id             - Random quote (Indonesia)`);
    console.log("=".repeat(50));
  });
}