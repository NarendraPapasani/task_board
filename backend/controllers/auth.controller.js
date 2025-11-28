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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: profession,
        isVerified: false,
        verificationToken: hashedOtp,
        gender: gender,
        age: age,
      },
    });

    const message = `Thank you for registering! Your verification code is: ${otp}`;

    try {
      await sendEmail({
        email: newUser.email,
        subject: "Email Verification Code",
        message,
        html: `<h1>Email Verification</h1><p>Your verification code is:</p><h2>${otp}</h2>`,
      });

      res.status(201).json({
        message:
          "User registered successfully. Please check your email for the verification code.",
      });
    } catch (err) {
      await prisma.user.delete({ where: { id: newUser.id } });

      console.error("Email send error:", err);
      res.status(500).json({
        message:
          "There was an error sending the email. Please check your email configuration.",
      });
    }
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

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

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

const VerifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.verificationToken !== hashedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ForgotPasswordAuth = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with that email address." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedOtp,
        resetPasswordExpires: passwordResetExpires,
      },
    });

    const message = `Your password reset code is: ${otp}. It is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Code",
        message,
        html: `<h1>Password Reset</h1><p>Your password reset code is:</p><h2>${otp}</h2><p>It is valid for 10 minutes.</p>`,
      });

      res.status(200).json({
        message: "OTP sent to email!",
      });
    } catch (err) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      return res.status(500).json({
        message: "There was an error sending the email. Try again later.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ResetPasswordAuth = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email, OTP, and new password" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        email,
        resetPasswordToken: hashedOtp,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    const token = signToken(user.id);

    res.status(200).json({
      message: "Password reset successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  RegisterAuth,
  LoginAuth,
  VerifyEmail,
  ForgotPasswordAuth,
  ResetPasswordAuth,
};
