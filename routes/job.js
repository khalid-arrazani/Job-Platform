import express from "express";

const router = express.Router();

import { protect } from "../middlewares/check.js";
import { recruiterOnly } from "../middlewares/role.js";

import {
  getAllJobs,
  getMyJobs,
  getJobById,
  createJob
} from "../controllers/jobController.js";



router.get(
  "/Jobs",
  protect,
  getAllJobs
);

router.get(
  "/My-Jobs",
  protect,
  recruiterOnly,
  getMyJobs
);

router.get(
  "/Jobs/:id",
  protect,
  getJobById
);

router.post(
  "/PostJob",
  protect,
  recruiterOnly,
  createJob
);

export default router;