import express from "express";
import User from "../models/User.js";
import { validateUserRegistration } from "../models/User.js";
const router = express.Router();
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import upload from "../middlewares/uploadCv.js";
import { protect } from "../middlewares/check.js";
import { sendVerificationCode, sendPasswordResetEmail } from "../service/emailServiece.js";
import crypto from "crypto";



// Register
router.post(
  "/register", upload.single("cv"),
  asyncHandler(async (req, res) => {
    const { email, password, username, role } = req.body;

    const { error } = validateUserRegistration({ email, password, username });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      email,
      password,
      username,
      role,
      cv: req.file ? req.file.path : null,
      cvPublicId: req.file ? req.file.filename : null
    });
    const savedUser = await newUser.save();

    const userObj = savedUser.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
  }),
);

// Login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );


    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );




    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.device !== req.headers["user-agent"]
    );

    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      device: req.headers["user-agent"]
    });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({
      message: "Login successful!",
      accessToken,
    });
  })
);



//refresh token
router.post("/refresh-token", asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }
 
  // 1. verify JWT first
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 2. check session
  const valid = user.refreshTokens.some(
    (t) => t.token === refreshToken
  );

  if (!valid) {
    return res.status(401).json({ message: "Invalid session" });
  }

  // 3. generate new access token
  const newAccessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // 4. update refresh token in db
  user.refreshTokens = user.refreshTokens.filter(
    (t) => t.token !== refreshToken
  );

  user.refreshTokens.push({
    token: newRefreshToken,
    createdAt: new Date(),
    device: req.headers["user-agent"]
  });

  await user.save();
  
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ accessToken: newAccessToken });
}));

// Logout
router.post(
  "/logout", protect,
  asyncHandler(async (req, res) => {
    const user = req.user;

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== req.cookies.refreshToken
    );
    await user.save();
    res.clearCookie("refreshToken");
    res.json({ message: "Logout successful!" });
  })
);


//verify email
router.get(
  "/verify-email",
  protect,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const code = Math.floor(100000 + Math.random() * 900000);
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    await sendVerificationCode(user.email, code);
    res.json({ message: "Verification code sent to email!" });
  })
);


// verify email code
router.post(
  "/verify-code",
  protect,
  asyncHandler(async (req, res) => {
    const { code } = req.body;

    const user = req.user;

    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (Date.now() > user.verificationCodeExpires) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  })
);


// Request password reset link
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;


    await sendPasswordResetEmail(user.email, resetLink);

    res.json({ message: "Password reset link sent to email!" });
  })
);

// Reset password
router.post(
  "/reset-password/:token",
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful!" });
  })
);


export default router;
