const prisma = require("../utils/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret_key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

const RegisterAuth = async (req, res) => {
  try {
    const { fullName, email, password, profession, gender, age } = req.body;

    if (!fullName || !email || !password || !gender || !age) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (
      profession !== "Developer" &&
      profession !== "Designer" &&
      profession !== "Manager" &&
      profession !== "HR"
    ) {
      return res
        .status(400)
        .json({ message: "Please provide a valid profession" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Removed OTP generation and email sending for simplified deployment
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: profession,
        isVerified: true, // Auto-verify
        verificationToken: null,
        gender: gender,
        age: age,
      },
    });

    res.status(201).json({
      message: "User registered successfully. Please login.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const LoginAuth = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Removed isVerified check since we auto-verify now

    const token = signToken(user.id);

    user.password = undefined;
    user.verificationToken = undefined;

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const VerifyEmail = async (req, res) => { ... } // Removed
// const ForgotPassword = async (req, res) => { ... } // Removed
// const ResetPassword = async (req, res) => { ... } // Removed

module.exports = {
  RegisterAuth,
  LoginAuth,
};
