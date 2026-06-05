import express from "express";

const router = express.Router();

import { protect } from "../middlewares/check.js";
import { recruiterOnly } from "../middlewares/role.js";

import {
  getRecruiterProfile,
  createRecruiterProfile,
  updateRecruiterProfile
} from "../controllers/recruiterProfileController.js";



router.get(
  "/me",
  protect,
  recruiterOnly,
  getRecruiterProfile
);



router.post(
  "/",
  protect,
  recruiterOnly,
  createRecruiterProfile
);



router.put(
  "/me",
  protect,
  recruiterOnly,
  updateRecruiterProfile
);

export default router;