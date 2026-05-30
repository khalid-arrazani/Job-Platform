import express from "express";

const router = express.Router();

import { protect } from "../middlewares/check.js";
import authorizeRoles from "../middlewares/authorizeApply.js";

import {
  getMyProfile,
  createProfile,
  updateProfile
} from "../controllers/jobSeekerProfileController.js";
import { uploadImage } from "../middlewares/Multer.js";



router.get(
  "/me",
  protect,
  authorizeRoles("jobSeeker"),
  getMyProfile
);

router.post(
  "/",
  protect,
  authorizeRoles("jobSeeker"),
  uploadImage,
  createProfile
);

router.put(
  "/me",
  protect,
  authorizeRoles("jobSeeker"),
  updateProfile
);

export default router;