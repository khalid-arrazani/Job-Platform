import express from "express";
import Job from "../models/Job.js";
import Apply from "../models/Apply.js";

const router = express.Router();
import asyncHandler from "express-async-handler";

import { protect } from "../middlewares/check.js";
import { recruiterOnly } from "../middlewares/role.js";




router.get(
  "/jobs",
  protect,
  recruiterOnly,
  asyncHandler(async (req, res) => {

    const jobs = await Job.find({ createdBy: req.user.id });

    res.json(jobs);
  })
);

router.get(
  "/jobs/:jobId/applications",
  protect,
  recruiterOnly,
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

router.patch(
  "/applications/:id",
  protect,
  recruiterOnly,
  asyncHandler(async (req, res) => {

   
    const { status } = req.body;
    const allowedStatus = ["pending", "accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

 const application = await Apply.findById(req.params.id).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    await application.save();
    res.json({
      message: "Application updated",
      application
    });

  })
);