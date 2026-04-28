import express from "express";

const router = express.Router();

import upload from "../middlewares/uploadCv.js";
import { protect } from "../middlewares/check.js";

import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  sendVerificationEmail,
  verifyEmailCode,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";



router.post(
  "/register",
  upload.single("cv"),
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/refresh-token",
  refreshAccessToken
);

router.post(
  "/logout",
  protect,
  logoutUser
);

router.post(
  "/verify-email",
  protect,
  sendVerificationEmail
);

router.post(
  "/verify-code",
  protect,
  verifyEmailCode
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

export default router;