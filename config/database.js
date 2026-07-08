const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Jangan pakai process.exit(1) di serverless — cukup throw
  throw new Error("❌ MONGODB_URI tidak ditemukan di environment variables!");
}

// ✅ Cache koneksi di global supaya reuse antar invocation serverless
// (mencegah "connection exhaustion" karena tiap request bikin koneksi baru)
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10, // batasi pool, penting di serverless
      })
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // reset supaya retry di request berikutnya
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;