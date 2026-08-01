import express from "express";

const router = express.Router();

import { protect } from "../middlewares/check.js";

import {
  getMyAccount,
  updateMyAccount,
  deleteMyAccount,
  changePassword
} from "../controllers/userController.js";

// get my profile for jobSeeker and recruiter
router.get(
  "/me",
  protect,
  getMyAccount
);


// update my profile for jobSeeker and recruiter
router.patch(
  "/me",
  protect, updateMyAccount
);

// delete my account for jobSeeker and recruiter
router.delete(
  "/me",
  protect, deleteMyAccount
);

//change password for jobSeeker and recruiter
router.post(
  "/change-password",
  protect, changePassword
);


export default router;