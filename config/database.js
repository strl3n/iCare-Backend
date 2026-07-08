const mongoose = require("mongoose");
require("dotenv").config();

// ✅ PASTIKAN MONGODB_URI ADA
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI tidak ditemukan di environment variables!");
  process.exit(1);
}

console.log(`📁 MONGODB_URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

// ✅ Koneksi dengan konfigurasi yang lebih robust
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 detik
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;