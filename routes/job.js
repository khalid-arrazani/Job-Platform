import express from "express";
import Job from "../models/Job.js";
import Apply from "../models/Apply.js";

const router = express.Router();
import asyncHandler from "express-async-handler";

import { protect } from "../middlewares/check.js";
import { recruiterOnly } from "../middlewares/role.js";
import {validateJobsDetails} from "../models/Job.js"

router.get(
  "/jobs",
  protect,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const jobs = await Job.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "username");

    if(jobs.length === 0){
    return res.status(404).json({message:"No jobs found"})
   }
    const total = await Job.countDocuments();
    res.json({
  total,
  page,
  results: jobs.length,
  jobs
});
  }),
);


router.get(
  "/jobs/:id",
  protect,
  asyncHandler(async (req, res) => {
   const jobById = await Job.findById(req.params.id).populate("createdBy", "username email");;
   if(!jobById){
    return res.status(404).json({message:"No job found"})
   }
    res.json(jobById);
  }),
);



router.post(
  "/jobs",
  protect,
  recruiterOnly,
  asyncHandler(async (req, res) => {
    const { error } = validateJobsDetails(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const job = await Job.create({
      ...req.body,
      createdBy: req.user.id 
    });

    res.status(201).json(job);
  })
);


router.post(
  "/jobs/:id/apply",
  protect,
  asyncHandler(async (req, res) => {

    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const alreadyApplied = await Apply.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Apply.create({
      job: jobId,
      applicant: req.user.id
    });

    res.status(201).json({
      message: "Applied successfully",
      application
    });
  })
);






