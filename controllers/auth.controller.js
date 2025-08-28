const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const { registerSchema } = require("../validations/auth.validation");
const {
  generateAccessToken,
  findUserById,
} = require("../services/authService");
const { sendEmail } = require("../services/mailService");

const signup = async (req, res, next) => {
  try {
    const parsedData = registerSchema.parse(req.body);
    const { username, email, password } = parsedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new ApiError(400, "Email already exists"));

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Send Verification Email
    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    newUser.verificationToken = token;
    newUser.verificationTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await newUser.save();

    const verifyLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`,
    });

    const tokenJWT = generateAccessToken(newUser._id);
    const user = await findUserById(newUser._id);

    res.status(201).json({ token: tokenJWT, user });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return next(new ApiError(401, "Invalid credentials"));

    if (!user.isVerified) return next(new ApiError(403, "Email not verified"));

    if (user.isBlocked) return next(new ApiError(403, "Account blocked"));

    const token = generateAccessToken(user._id);
    const userData = await findUserById(user._id);

    res.json({ token, user: userData });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) return next(new ApiError(400, "Verification token missing"));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new ApiError(400, "Invalid or expired token"));
    }

    const user = await User.findById(decoded._id);

    if (!user) return next(new ApiError(400, "User not found"));

    if (user.isVerified)
      return next(new ApiError(400, "Email already verified"));

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Redirect to frontend
    // res.redirect(`${process.env.FRONTEND_URL}/auth/email-verified`);

    // res.json({ message: "Email verified" });
    res.json({ message: "Email verified" });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new ApiError(404, "User not found"));

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    user.passwordResetToken = token;
    user.passwordResetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/auth/change-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return next(new ApiError(401, "User not found"));

    const { password } = req.body;

    if (!password) return next(new ApiError(400, "New password is required"));

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    // res.redirect(process.env.FRONTEND_URL);
    res.json({ message: "Password changed" });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = { signup, login, verifyEmail, resetPassword, changePassword };
