import express from "express";

const router = express.Router();

import { protect } from "../middlewares/check.js";
import { recruiterOnly } from "../middlewares/role.js";

import {
  getAllJobs,
  getMyJobs,
  getJobById,
  createJob,
  deleteMyJobs,
 
  toggleStatus,
  UpdateJob
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

router.delete(
  "/Delete_My-Jobs/:JobId",
  protect,
  recruiterOnly,
  deleteMyJobs
);


router.put(
  "/Status_My-Jobs/:JobId",
  protect,
  recruiterOnly,
  toggleStatus
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
router.put(
  "/UpdateJob/:JobId",
  protect,
  recruiterOnly,
  UpdateJob
);


export default router;