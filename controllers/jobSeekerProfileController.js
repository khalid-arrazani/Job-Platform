import asyncHandler from "express-async-handler";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import User from "../models/User.js";
import { validateJobSeekerProfile } from "../models/JobSeekerProfile.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js"
import cloudinary from "../config/cloudinary.js";



/* ======================
   JOB SEEKER PROFILE
====================== */



// Get current authenticated job seeker profile
export const getMyProfile = asyncHandler(async (req, res) => {

  const profile = await JobSeekerProfile.findOne({
    userId: req.user.id
  }).populate("userId", "email role isComplete");

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

  const image =
    await uploadToCloudinary(
      req.file.buffer
    );

  const profile = await JobSeekerProfile.create({
    userId: req.user.id,
    ProfileImage: image.secure_url,
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
    profile: profile,
    Profile: image.secure_url
  });
});



// Update Profile Photo
export const UpdatePhotoProfile = asyncHandler(async (req, res) => {

  console.log(req.file);

  const exists = await JobSeekerProfile.findOne({
    userId: req.user.id
  });

  if (!exists) {
    return res.status(400).json({
      message: "Profile not exists"
    });
  };

  if (!req.file) {
    return res.status(400).json({
      message:
        "Image is required"
    });
  }

  if (exists.ProfileImage.public_id) {
    await cloudinary.uploader.destroy(
      exists.ProfileImage.public_id
    );
  }

  const image = await uploadToCloudinary(
    req.file.buffer
  );



  const profile = await JobSeekerProfile.findOneAndUpdate(
    {
      userId: req.user.id
    },
    {
      ProfileImage: {
        url: image.secure_url,
        public_id: image.public_id
      }
    },
    {
      returnDocument: "after"
    }
  ).populate("userId", "email role isComplete");

  res.status(200).json({
    success: true,
    message: "Profile photo updated successfully",
    profile: profile,
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
    "headline",
    "aboutMe",
    "skills",
    "experience",
    "education",
    "socialLinks",
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
    { returnDocument: "after" }
  ).populate("userId", "email role isComplete");

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found"
    });
  }

  res.status(200).json({ profile });
});