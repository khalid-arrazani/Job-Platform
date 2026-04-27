import asyncHandler from "express-async-handler";
import Apply from "../models/Apply.js";
import Job from "../models/Job.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";


// ===============================
// Apply for a job
// This controller allows a job seeker to apply for a job.
// It uses the CV from the user's profile by default,
// but replaces it if a new CV is uploaded.
// Then it creates a new application linked to the job,
// the user's profile, and the applicant.
// ===============================
export const applyForJobs = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;

  let cvUrl = req.user.cv || null;
  let cvPublicId = req.user.cvPublicId || null;

  const jobSeekerProfile = await JobSeekerProfile.findOne({
    userId: req.user.id
  });

  if (req.file) {
    cvUrl = req.file.path;
    cvPublicId = req.file.filename;
  }

  const newApplication = await Apply.create({
    job: jobId,
    profile: jobSeekerProfile._id,
    applicant: req.user.id,
    cv: cvUrl,
    cvPublicId: cvPublicId
  });

  res.status(201).json({
    message: "Applied successfully",
    application: {
      ...newApplication._doc,
      cvSource: req.file ? "uploaded" : "profile"
    }
  });
});



// ===============================
// Get my applications (JobSeeker)
// This controller returns all applications of the logged-in job seeker.
// It only allows users with role "jobSeeker".
// It also populates job information for better response.
// ===============================
export const getMyApplicationForJobSeeker = asyncHandler(async (req, res) => {
  if (req.user.role !== "jobSeeker") {
    return res.status(403).json({ message: "Access denied" });
  }

  const userApplications = await Apply.find(
    { applicant: req.user.id },
    "status"
  ).populate(
    "job",
    "title description company jobType experienceLevel"
  );

  res.json(userApplications);
});



// ===============================
// Get applicants for a recruiter's job
// This controller allows a recruiter to fetch all applications
// for a job they created. It first verifies job ownership,
// then returns all related applications with applicant data.
// ===============================
export const getApplicantForMyJobForRecruter = asyncHandler(async (req, res) => {
  const recruiterJob = await Job.findOne({
    _id: req.params.jobId,
    createdBy: req.user.id
  });

  if (!recruiterJob) {
    return res.status(404).json({ message: "Job not found" });
  }

  const jobApplications = await Apply.find(
    { job: req.params.jobId },
    "status"
  )
    .populate("applicant", "username email")
    .populate("job", "title");

  res.json({
    applications: jobApplications
  });
});



// ===============================
// Accept or reject an application
// This controller allows a recruiter to update the status
// of an application (accepted or rejected).
// It validates the status, checks ownership of the job,
// then updates and saves the application.
// ===============================
export const acceptedOrRejectedApplication = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const applicationToUpdate = await Apply.findById(req.params.id)
    .populate("job", "title createdBy company")
    .populate("applicant", "username email role")
    .populate("profile", "fullName location");

  if (!applicationToUpdate) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (applicationToUpdate.job.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  applicationToUpdate.status = status;
  await applicationToUpdate.save();

  res.json({
    message: `Application ${status}`,
    application: applicationToUpdate
  });
});



// ===============================
// Cancel my application
// This controller allows a job seeker to delete their application
// for a specific job. It ensures that the application belongs
// to the logged-in user before deleting it.
// ===============================
export const cancelMyApplication = asyncHandler(async (req, res) => {
  const jobId = req.params.id;

  const deletedApplication = await Apply.findOneAndDelete({
    job: jobId,
    applicant: req.user.id
  });

  if (!deletedApplication) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json({ message: "Application removed" });
});