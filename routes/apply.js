import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middlewares/check.js";

import Apply from "../models/Apply.js";
import Job from "../models/Job.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";

const router = express.Router();
import  authorizeRoles from "../middlewares/authorizeApply.js";

import isAlreadyApplied  from "../middlewares/IsAlreadyApplied.js";
import upload from "../middlewares/uploadCv.js";


// apply for a job with cv upload or use cv from profile for jobSeeker
router.post(
  "/:jobId",
  protect,
  authorizeRoles("jobSeeker"),
  isAlreadyApplied,
  upload.single("cv"),
  asyncHandler(async (req, res) => {
    
    const jobId = req.params.jobId;
    let cvUrl = req.user.cv || null;
    let cvPublicId = req.user.cvPublicId || null;

    const idProfile = await JobSeekerProfile.findOne({userId : req.user.id})

    if (req.file) {
      cvUrl = req.file.path;
      cvPublicId = req.file.filename;
    }

    const application = await Apply.create({
      job: jobId,
      profile:idProfile.id,
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
  authorizeRoles("jobSeeker"),
  asyncHandler(async (req, res) => {
    if (req.user.role !== "jobSeeker") {
      return res.status(403).json({ message: "Access denied" });
    }

    const applications = await Apply.find({ applicant: req.user.id },"status")
      .populate("job","title description company jobType experienceLevel");

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
    },"status")
    .populate("applicant", "username email")
    .populate("job", "title");

    res.json({
      applications
    });
  })
);


//accepted or rejected application
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("recruiter"),
  asyncHandler(async (req, res) => {

    const { status } = req.body;

    
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    };

    
    const application = await Apply.findById(req.params.id,"cv").populate("job" , "title createdBy company") 
    .populate("applicant", "username email role").populate("profile","fullName location");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    };
  
    if (application.job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    };

    
    application.status = status;
    await application.save();

    res.json({
      message: `Application ${status}`,
      application
    });
  })
);

// delete application for jobSeeker
router.delete(
  "/:id",
  protect,
  authorizeRoles("jobSeeker"),
  asyncHandler(async (req, res) => {
  console.log(req.params.id,req.user.id);
  const application = await Apply.findOneAndDelete({job:req.params.id , applicant : req.user.id});

    if (!application) {
      return res.status(404).json({ message: "Not found" });
    };
  
    res.json({ message: "Application removed" });
  })
);

export default router;



