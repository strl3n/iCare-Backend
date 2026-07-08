const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// Format user response
const formatUserResponse = (user) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture || null,
    isGoogleLogin: user.isGoogleLogin || false,
  };
};

// @desc    Register User
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    console.log("📥 Register request body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Validasi manual
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, dan password wajib diisi",
      });
    }

    console.log(`🔍 Mencari user dengan email: ${email}`);

    // Cek user sudah ada
    const existingUser = await User.findOne({ email });
    console.log(`📊 Existing user: ${existingUser}`);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar. Silakan login.",
      });
    }

    // Buat user baru
    console.log("📝 Membuat user baru...");
    const user = await User.create({
      name,
      email,
      password,
      isGoogleLogin: false,
    });
    console.log(`✅ User created: ${user._id}`);

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil! Silakan login.",
      data: formatUserResponse(user),
      token,
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ... (login, googleLogin, getMe tetap sama)