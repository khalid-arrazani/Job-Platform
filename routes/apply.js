import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middlewares/check.js";

import Apply from "../models/Apply.js";
import Job from "../models/Job.js";

const router = express.Router();
import { authorizeRoles } from "../middlewares/role.js";
import { isAlreadyApplied } from "../middlewares/apply.js";
import upload from "../utils/multer.js";


// apply for a job with cv upload or use cv from profile for jobSeeker
router.post(
  "/:jobId",
  protect,
  authorizeRoles("jobseeker"),
  isAlreadyApplied,
  upload.single("cv"),
  asyncHandler(async (req, res) => {
    
    const jobId = req.params.jobId;
    let cvUrl = req.user.cv || null;
    let cvPublicId = req.user.cvPublicId || null;

    if (req.file) {
      cvUrl = req.file.path;
      cvPublicId = req.file.filename;
    }
    const application = await Apply.create({
      job: jobId,
      applicant: req.user.id,
      cv: cvUrl,
      cvPublicId: cvPublicId
    });

    res.status(201).json({
      message: "Applied successfully",
      application: {
        ...application._doc,
        cvSource: req.file ? "uploaded" : "profile"
      }
    });
  })
);



// get my applications for jobSeeker
router.get(
  "/my-applications",
  protect,
  authorizeRoles("jobseeker"),
  asyncHandler(async (req, res) => {
    if (req.user.role !== "jobSeeker") {
      return res.status(403).json({ message: "Access denied" });
    }

    const applications = await Apply.find({ applicant: req.user.id })
      .populate("job");

    res.json(applications);
  })
);

// get applications for a job for recruiter
router.get(
  "/jobs/:jobId/applications",
  protect,
 authorizeRoles("recruiter"),
  asyncHandler(async (req, res) => {

    const job = await Job.findOne({
      _id: req.params.jobId,
      createdBy: req.user.id
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applications = await Apply.find({
      job: req.params.jobId
    })
    .populate("applicant", "username email")
    .populate("job", "title");

    res.json({
      job,
      applications
    });
  })
);

// delete application for jobSeeker
router.delete(
  "/:id",
  protect,
  authorizeRoles("jobseeker"),
  asyncHandler(async (req, res) => {
    const application = await Apply.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Not found" });
    }

    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await application.deleteOne();

    res.json({ message: "Application removed" });
  })
);



