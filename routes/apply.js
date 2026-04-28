import express from "express";

const router = express.Router();

import { protect } from "../middlewares/check.js";
import authorizeRoles from "../middlewares/authorizeApply.js";
import isAlreadyApplied from "../middlewares/IsAlreadyApplied.js";
import upload from "../middlewares/uploadCv.js";

import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication
} from "../controllers/applyController.js";



router.post(
  "/:jobId",
  protect,
  authorizeRoles("jobSeeker"),
  isAlreadyApplied,
  upload.single("cv"),
  applyForJob
);

router.get(
  "/my-applications",
  protect,
  authorizeRoles("jobSeeker"),
  getMyApplications
);

router.get(
  "/jobs/:jobId/applications",
  protect,
  authorizeRoles("recruiter"),
  getJobApplications
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("recruiter"),
  updateApplicationStatus
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("jobSeeker"),
  deleteApplication
);

export default router;