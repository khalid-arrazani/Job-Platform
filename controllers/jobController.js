import Job from "../models/Job.js";
import asyncHandler from "express-async-handler";
import { validateJobsDetails } from "../models/Job.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import RecruiterProfile from "../models/RecruiterProfile.js";



// Get all jobs for job seekers with pagination
export const getAllJobs = asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;

  const limit = 10;

  const jobs = await Job.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("createdBy", "username");

  if (jobs.length === 0) {
    return res.status(404).json({
      message: "No jobs found"
    });
  }

  const total = await Job.countDocuments();

  res.status(200).json({
    total,
    page,
    results: jobs.length,
    jobs
  });
});



// Get all recruiter jobs with pagination
export const getMyJobs = asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;

  const limit = 4;

  const jobs = await Job.find({
    createdBy: req.user.id
  })
    .skip((page - 1) * limit)
    .limit(limit);

  if (jobs.length === 0) {
    return res.status(404).json({
      message: "No jobs found"
    });
  }

  const total = await Job.countDocuments();

  res.status(200).json({
    total,
    page,
    results: jobs.length,
    jobs
  });
});

// Get single job by id
export const getJobById = asyncHandler(async (req, res) => {

  const jobById = await Job.findById(req.params.id)
    .populate("createdBy");

  if (!jobById) {
    return res.status(404).json({
      message: "No job found"
    });
  }
  res.status(200).json(jobById);
});



// Create new job for recruiter

export const createJob = asyncHandler(async (req, res) => {


  const { error } = validateJobsDetails(req.body);
  
  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  const allowedFields = [
    "title",
    "description",
    "location",

    "salary",
    "salaryCurrency",

    "jobType",
    "workMode",

    "experienceLevel",
    "skills"
  ];

  const data = {};

  const profile = await RecruiterProfile.findOne({
    userId: req.user.id
  })

  if (!profile){
    res.status(404).json({message:"Profile not found "})
  }
   
  

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  });

  const job = await Job.create({
    ...data,
    createdBy: profile._id
  });

  res.status(201).json({ job:job ,message :"Create Job seccesfully "});
});