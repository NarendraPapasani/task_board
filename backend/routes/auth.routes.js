const {
  RegisterAuth,
  LoginAuth,
  ForgotPasswordAuth,
  VerifyEmail,
  ResetPasswordAuth,
} = require("../controllers/auth.controller");

const router = require("express").Router();

router.post("/register", RegisterAuth);
router.post("/login", LoginAuth);
router.post("/forgot-password", ForgotPasswordAuth);
router.post("/verify-email", VerifyEmail);
router.post("/reset-password", ResetPasswordAuth);

module.exports = router;
