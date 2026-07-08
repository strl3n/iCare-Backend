const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  googleLogin,
  getMe,
} = require("../controllers/authController");
const auth = require("../middlewares/auth");

// ==================== ROUTES ====================

router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .withMessage("Nama wajib diisi")
      .isLength({ min: 3 })
      .withMessage("Nama minimal 3 karakter"),
    body("email")
      .isEmail()
      .withMessage("Format email tidak valid")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Format email tidak valid")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password wajib diisi"),
  ],
  login
);

router.post(
  "/google",
  [
    body("email")
      .isEmail()
      .withMessage("Format email tidak valid")
      .normalizeEmail(),
    body("name").notEmpty().withMessage("Nama wajib diisi"),
  ],
  googleLogin
);

router.get("/me", auth, getMe);

module.exports = router;