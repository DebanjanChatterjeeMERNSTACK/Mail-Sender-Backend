const Register = require("../models/registerModels");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset</h2>

        <p>You requested to reset your password.</p>

        <p>Click the button below to reset your password:</p>

        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#007bff;
            color:#fff;
            text-decoration:none;
            border-radius:5px;
          "
        >
          Reset Password
        </a>

        <p>This link will expire in 15 minutes.</p>

        <p>If you didn't request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
};



const register = async (req, res) => {
  try {
    const { name, password, appPassword, email } = req.body;

    if (!name && !email && !password && !appPassword) {
      return res
        .status(400)
        .send({ message: "Information Uncomplete", success: false });
    }

    const existMail = await Register.findOne({ email: email });
    if (existMail) {
      return res
        .status(400)
        .send({ message: "Mail Allready Register", success: false });
    }

    const hassPassword = await bcrypt.hash(password, 10);

    const data = await Register({
      name,
      email,
      password: hassPassword,
      appPassword,
    });
    data.save();
    res.status(200).send({ message: "Register Successful", success: true });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Information Uncomplete", success: false });
    }

    const data = await Register.findOne({ email });

    if (!data) {
      return res
        .status(400)
        .send({ message: "Invalid Details", success: false });
    }

    const match = await bcrypt.compare(password, data.password);

    if (!match) {
      return res
        .status(400)
        .send({ message: "Email & Password Are Unmatch", success: false });
    }

    // Generate JWT
    jwt.sign(
      { name: data.name, id: data._id, role: data.role },
      process.env.JWTKEY,
      { expiresIn: "7d" },
      (err, token) => {
        if (error) {
          return res
            .status(400)
            .send({ message: error.message, success: false });
        }

        return res
          .status(200)
          .send({ message: "Login Successfull", success: true, token });
      },
    );
  } catch (err) {
    res.status(400).send({ message: error.message, success: false });
  }
};



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await Register.findOne({ email });

    // Don't reveal whether email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists, a password reset link has been sent.",
      });
    }

    // Create reset token
    const resetToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name:user.name,
        purpose: "password-reset",
      },
      process.env.JWTKEY,
      {
        expiresIn: "15m",
      }
    );

    // Reset URL
    const resetUrl = `${process.env.URL}/reset-password/${resetToken}`;

    // Send email
    await sendResetPasswordEmail(user.email, resetUrl);

    console.log("Password reset URL:", resetUrl);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWTKEY);

    // Make sure this token is specifically for password reset
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    // Find user
    const user = await Register.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    // JWT expired
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Reset link has expired",
      });
    }

    // Invalid JWT
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset link",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};






module.exports = { register, login , resetPassword, forgotPassword};
