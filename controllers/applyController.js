import asyncHandler from "express-async-handler";

import Apply from "../models/Apply.js";
import Job from "../models/Job.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import RecruiterProfile from "../models/RecruiterProfile.js";
import { Company } from "../models/Company.js";



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
    company: req.body.Company
  });

  res.status(201).json({
    message: "Applied successfully"
  });
});



// Get all authenticated job seeker applications
export const getMyApplications = asyncHandler(async (req, res) => {


  const page = parseInt(req.query.page) || 1;
  const limit = 5;


  let filter = {
    applicant: req.user.id
  }
  const filterFields = ["status"]

  filterFields.forEach((field) => {
    if (req.query[field] !== undefined &&
      req.query[field].length >= 1 &&
      req.query[field] !== "") {
      filter[field] = req.query[field];
    }
  });


  const search = req.query.search || ""
  const sort = req.query.sort == "Newest First" ? -1 : req.query.sort == "Oldest First" ? 1 : 1


  const applications = await Apply.find(
    filter,
    "status createdAt"
  )
    .skip((page - 1) * limit)
    .limit(limit)

    .sort({ createdAt: sort })
    .populate(
      "company", "companyLogo name"
    )
    .populate(
      "job", "title createdAt location"
    )

  const countPending = await Apply.countDocuments({ applicant: req.user.id, status: "Pending" });
  const countUnder_review = await Apply.countDocuments({ applicant: req.user.id, status: "Under review" });
  const countAccepted = await Apply.countDocuments({ applicant: req.user.id, status: "Accepted" });
  const countInterview = await Apply.countDocuments({ applicant: req.user.id, status: "Interview" });
  const countRejected = await Apply.countDocuments({ applicant: req.user.id, status: "Rejected" });
  const totalJobs = await Apply.countDocuments(filter);


  res.status(200).json({ applications, totalPages: Math.ceil(totalJobs / limit), countPending, countUnder_review, countAccepted, countInterview, countRejected, hasApply: !!applications.length });
});



// Get all applications for a recruiter job
export const getJobApplications = asyncHandler(async (req, res) => {

  
  const profile = await RecruiterProfile.findOne({
    userId: req.user.id
  })

  if (!profile) {
    return res.status(404).json({
      message: "profile not found"
    });
  }

  const company = await Company.findOne({
    owner: profile._id
  });

  if (!company) {
    return res.status(404).json({
      message: "company not found"
    });
  }

  const applications = await Apply.find(
    { company: company._id },
    "status createdAt"
  )
    .populate("applicant", "username email location")
    .populate("job", "title jobType workMode")
    .populate("profile");

  res.status(200).json({
    applications
  });
});



// Accept or reject application
export const updateApplicationStatus = asyncHandler(async (req, res) => {

  const { status } = req.query;

  if (!["Accepted", "Interview", "Rejected", "Under review"].includes(status)) {
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