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

// ============================================================
// @desc    Register User
// @route   POST /api/auth/register
// ============================================================
const register = async (req, res) => {
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

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, dan password wajib diisi",
      });
    }

    console.log(`🔍 Mencari user dengan email: ${email}`);

    const existingUser = await User.findOne({ email });
    console.log(`📊 Existing user: ${existingUser}`);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar. Silakan login.",
      });
    }

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

// ============================================================
// @desc    Login User
// @route   POST /api/auth/login
// ============================================================
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validasi gagal",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login berhasil! Selamat datang kembali.",
      data: formatUserResponse(user),
      token,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================================================
// @desc    Login with Google
// @route   POST /api/auth/google
// ============================================================
const googleLogin = async (req, res) => {
  try {
    const { email, name, profilePicture } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email dan nama wajib diisi",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        profilePicture: profilePicture || null,
        isGoogleLogin: true,
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login dengan Google berhasil!",
      data: formatUserResponse(user),
      token,
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================================================
// @desc    Get Current User
// @route   GET /api/auth/me
// ============================================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: formatUserResponse(user),
    });
  } catch (error) {
    console.error("❌ Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================================================
// ✅ EXPORT SEMUA FUNGSI DI PALING BAWAH
// ============================================================
module.exports = {
  register,
  login,
  googleLogin,
  getMe,
};