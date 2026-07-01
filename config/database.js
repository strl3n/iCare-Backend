const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📁 Database: ${process.env.MONGODB_URI}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log("💡 Pastikan MongoDB sudah berjalan di localhost:27017");
    process.exit(1);
  }
};

module.exports = connectDB;
