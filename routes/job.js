import express from "express";
import Job from "../models/Job.js";

const router = express.Router();
import asyncHandler from "express-async-handler";

import { protect } from "../middlewares/check.js";
import { recruiterOnly } from "../middlewares/role.js";
import { validateJobsDetails } from "../models/Job.js"


// get all jobs for jobseeker with pagination
router.get(
  "/Jobs",
  protect,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const jobs = await Job.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "username");

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found" })
    }
    const total = await Job.countDocuments();
    res.status(200).json({
      total,
      page,
      results: jobs.length,
      jobs
    });
  }),
);

// get my jobs for recruiter with pagination
router.get(
  "/My-Jobs",
  protect,
  recruiterOnly,
  asyncHandler(async (req, res) => {


     const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const jobs = await Job.find({ createdBy: req.user.id })
      .skip((page - 1) * limit)
      .limit(limit);

    if (jobs.length === 0) {return res.status(404).json({ message: "No jobs found" })
    }
    const total = await Job.countDocuments();

    res.status(200).json({
      total,
      page,
      results: jobs.length,
      jobs
    });
  })
);

// get job by id for jobseeker and recruiter
router.get(
  "/Jobs/:id",
  protect,
  asyncHandler(async (req, res) => {
    const jobById = await Job.findById(req.params.id).populate("createdBy", "username email");
    if (!jobById) {
      return res.status(404).json({ message: "No job found" })
    }
    res.json(jobById);
  }),
);


// post job for recruiter
router.post(
  "/PostJob",
  protect,
  recruiterOnly,
  asyncHandler(async (req, res) => {
    const { error } = validateJobsDetails(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
const allowedFields = [
      "title",
      "description",
      "location",
      "salary",
      "company",
      "jobType",
      "experienceLevel",
      "skills"
    ];

    const data = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });
    const job = await Job.create({
      ...data,
      createdBy: req.user.id
    });

    res.status(201).json(job);
  })
);



export default router;



