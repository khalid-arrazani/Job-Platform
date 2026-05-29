import asyncHandler from "express-async-handler";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import User from "../models/User.js";
import { validateJobSeekerProfile } from "../models/JobSeekerProfile.js";




/* ======================
   JOB SEEKER PROFILE
====================== */



// Get current authenticated job seeker profile
export const getMyProfile = asyncHandler(async (req, res) => {

  const profile = await JobSeekerProfile.findOne({
    userId: req.user.id
  });

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    profile: profile
  });
});



// Create job seeker profile for the first time
export const createProfile = asyncHandler(async (req, res) => {

  const { error } = validateJobSeekerProfile(req.body);

  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }

  const exists = await JobSeekerProfile.findOne({
    userId: req.user.id
  });

  if (exists) {
    return res.status(400).json({
      message: "Profile already exists"
    });
  };


  const profile = await JobSeekerProfile.create({
    userId: req.user.id,
    ...req.body
  });

  await User.findByIdAndUpdate(
    req.user.id,
    {
      isComplete: true,
    }
  );

  res.status(201).json({
    success: true,
    message: "Profile created successfully",
    profile: profile
  });
});



// Update authenticated job seeker profile
export const updateProfile = asyncHandler(async (req, res) => {

  const { error } = validateJobSeekerProfile(
    req.body,
    true
  );

  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }

  const allowedFields = [
    "fullName",
    "bio",
    "skills",
    "experience",
    "education",
    "location",
    "cv"
  ];

  const updateData = {};

  allowedFields.forEach((field) => {

    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: req.user.id },
    { $set: updateData },
    { new: true }
  );

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found"
    });
  }

  res.status(200).json(profile);
});