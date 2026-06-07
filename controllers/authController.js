import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import {
  validateUserRegistration,
  loginSchema
} from "../models/User.js";
import {
  sendVerificationCode,
  sendPasswordResetEmail
} from "../service/emailServiece.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";



// Register controller
export const registerUser = asyncHandler(async (req, res) => {

  const { email, password, username, role } = req.body;
  
  const { error } = validateUserRegistration({
    email,
    password,
    username,
    role
  });

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  const userExists = await User.findOne({ email });
 
  if (userExists) {
    return res.status(400).json({
      message: "User already exists"
    });
  }

  const newUser = new User({
    email,
    password,
    username,
    role
  });

  const savedUser = await newUser.save();

  const userObj = savedUser.toObject();
  delete userObj.password;

res.status(201).json({
  message: "Registered successfully",
  user: userObj
});
});



// Login controller
export const loginUser = asyncHandler(async (req, res) => {

  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "Invalid email or password"
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.expiresAt > Date.now()
  );

  const { accessToken, refreshToken } = user.generateTokens();

  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.device !== req.headers["user-agent"]
  );

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    device: req.headers["user-agent"],
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });

  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      isComplete: user.isComplete
    }
  });
});



// Refresh token controller
export const refreshAccessToken = asyncHandler(async (req, res) => {

  const oldrefreshToken = req.cookies.refreshToken;

  if (!oldrefreshToken) {
    return res.status(401).json({
      message: "No refresh token"
    });
  };

  const decoded = jwt.verify(
    oldrefreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  };

  const valid = user.refreshTokens.some(
    (t) => t.token === oldrefreshToken
  );

  if (!valid) {
    return res.status(401).json({
      message: "Invalid session"
    });
  };

  const { accessToken, refreshToken } = user.generateTokens();

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== oldrefreshToken
  );

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.expiresAt > Date.now()
  );

  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    device: req.headers["user-agent"],
    ip: req.ip,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });

  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000 // 15 minutes
  });


  res.status(200).json({
    success: true,
    message: "Tokens refreshed successfully"
  });
});



// Logout controller
export const logoutUser = asyncHandler(async (req, res) => {

  const user = req.user;

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== req.cookies.refreshToken
  );

  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.expiresAt > Date.now()
  );

  await user.save();

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  res.json({
    message: "Logout successful!"
  });
});



// Send verification email controller
export const sendVerificationEmail = asyncHandler(async (req, res) => {

  const { email } = req.body;

  const user = req.user;

  if (!email || user.email != email) {
    return res.status(401).json({
      message: "Email is not match or not defined"
    });
  }

  if (user.emailVerified) {
    return res.json({
      message: "Email already verified"
    });
  }

  if (Date.now() < user.sentAt) {
    return res.status(429).json({
      message: "Wait before requesting again"
    });
  }

  const code = crypto.randomInt(100000, 999999).toString();

  user.verificationCode = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;

  user.sentAt = Date.now() + 90000;

  await user.save();

  await sendVerificationCode(user.email, code);

  res.status(200).json({
    message: "Verification code sent to email!"
  });
});



// Verify email code controller
export const verifyEmailCode = asyncHandler(async (req, res) => {

  const code = req.body.code.trim();

  const user = req.user;

  if (!code || code.length < 6) {
    return res.status(400).json({
      message: "Code is short or undifined"
    });
  }

  if (user.emailVerified) {
    return res.status(400).json({
      message: "Email already verified"
    });
  }

  const codeHash = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  if (
    !user.verificationCode ||
    user.verificationCode !== codeHash
  ) {
    return res.status(400).json({
      message: "Invalid verification code"
    });
  }

  if (Date.now() > user.verificationCodeExpires) {
    return res.status(400).json({
      message: "Verification code expired"
    });
  }

  user.emailVerified = true;

  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  res.json({
    message: "Email verified successfully!"
  });
});

// Get Forgot password View controller
export const getForgotPasswordView = asyncHandler(async (req, res) => {
  res.render("forgot-password");
})


// Forgot password controller
export const forgotPassword = asyncHandler(async (req, res) => {

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.resetPasswordToken = hashedToken;

  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetLink =
    `https://job-platform-production-d619.up.railway.app/api/auth/reset-password/${token}`;

  await sendPasswordResetEmail(user.email, resetLink);

  res.render("forgot-password-success");
});


export const getResetPasswordView = asyncHandler(async (req, res) => {
  res.render("reset-password");
})




// Reset password controller
export const resetPassword = asyncHandler(async (req, res) => {

  const { token } = req.params;

  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      message: "Password too short"
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match"
    });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired token"
    });
  }

  user.password = newPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.render("reset-password-success");
});