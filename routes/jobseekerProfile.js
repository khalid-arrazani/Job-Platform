import express from "express";

const router = express.Router();

import { protect } from "../middlewares/check.js";
import authorizeRoles from "../middlewares/authorizeApply.js";

import {
  getMyProfile,
  createProfile,
  updateProfile,
  UpdatePhotoProfile,
  BringProfileByIdJs
} from "../controllers/jobSeekerProfileController.js";

import { uploadImage } from "../middlewares/Multer.js";



router.get(
  "/me",
  protect,
  authorizeRoles("jobSeeker"),
  getMyProfile
);


router.get(
  "/:ProfileId",
  protect,
  authorizeRoles("jobSeeker"),
  BringProfileByIdJs
);


router.post(
  "/",
  protect,
  authorizeRoles("jobSeeker"),
  uploadImage,
  createProfile
);

router.put(
  "/update-ProfilePhoto",
  protect,
  authorizeRoles("jobSeeker"),
  uploadImage,
  UpdatePhotoProfile
);

router.put(
  "/me",
  protect,
  authorizeRoles("jobSeeker"),
  updateProfile
);

export default router;