import asyncHandler from "express-async-handler";

import Apply from "../models/Apply.js";
import Job from "../models/Job.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";



/* ======================
   JOB APPLICATIONS
====================== */



// Apply for a job using uploaded CV or profile CV
export const applyForJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;

  let cvUrl = req.user.cv || null;

  let cvPublicId = req.user.cvPublicId || null;

  const idProfile = await JobSeekerProfile.findOne({
    userId: req.user.id
  });

  if (req.file) {
    cvUrl = req.file.path;
    cvPublicId = req.file.filename;
  }

  const application = await Apply.create({
    job: jobId,
    profile: idProfile.id,
    applicant: req.user.id,
    cv: cvUrl,
    cvPublicId,
    company:req.body.Company
  });

  res.status(201).json({
    message: "Applied successfully"
  });
});



// Get all authenticated job seeker applications
export const getMyApplications = asyncHandler(async (req, res) => {

  const applications = await Apply.find(
    { applicant: req.user.id },
    "status"
  )
    .populate(
      "company",
      "title description company jobType experienceLevel"
    );

  res.status(200).json(applications);
});



// Get all applications for a recruiter job
export const getJobApplications = asyncHandler(async (req, res) => {
  
  const job = await Job.findOne({
    _id: req.params.jobId,
    createdBy: req.user.id
  });

  if (!job) {
    return res.status(404).json({
      message: "Job not found"
    });
  }

  const applications = await Apply.find(
    { job: req.params.jobId },
    "status"
  )
    .populate("applicant", "username email")
    .populate("job", "title");

  res.status(200).json({
    applications
  });
});



// Accept or reject application
export const updateApplicationStatus = asyncHandler(async (req, res) => {

  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status"
    });
  }

  const application = await Apply.findById(
    req.params.id,
    "cv"
  )
    .populate("job", "title createdBy company")
    .populate("applicant", "username email role")
    .populate("profile", "fullName location");

  if (!application) {
    return res.status(404).json({
      message: "Application not found"
    });
  }

  if (
    application.job.createdBy.toString() !== req.user.id
  ) {
    return res.status(403).json({
      message: "Not allowed"
    });
  }

  application.status = status;

  await application.save();

  res.status(200).json({
    message: `Application ${status}`,
    application
  });
});



// Delete authenticated job seeker application
export const deleteApplication = asyncHandler(async (req, res) => {

  const application = await Apply.findOneAndDelete({
    job: req.params.id,
    applicant: req.user.id
  });

  if (!application) {
    return res.status(404).json({
      message: "Not found"
    });
  }

  res.status(200).json({
    message: "Application removed"
  });
});