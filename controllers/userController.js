import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import RecruiterProfile from "../models/recruiterProfile.js";
import Job from "../models/Job.js";
import Apply from "../models/Apply.js";



/* ======================
   USER PROFILE
====================== */



// Get authenticated user profile
export const getMyAccount = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user.id)
    .select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.status(200).json(user);
});



// Update authenticated user profile
export const updateMyAccount = asyncHandler(async (req, res) => {

  const allowedFields = [
    "username",
    "email"
  ];

  const data = {};

  allowedFields.forEach((field) => {

    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  });

  const isEmailTaken = await User.findOne({
    email: data.email,
    _id: { $ne: req.user.id }
  });

  if (isEmailTaken) {
    return res.status(400).json({
      message: "Email already in use"
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: data },
    { new: true }
  ).select("-password");

  res.status(200).json(user);
});



// Delete authenticated user account and related data
export const deleteMyAccount = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  await JobSeekerProfile.findOneAndDelete({
    userId: req.user.id
  });

  await RecruiterProfile.findOneAndDelete({
    userId: req.user.id
  });

  await Job.deleteMany({
    createdBy: req.user.id
  });

  await Apply.deleteMany({
    applicant: req.user.id
  });

  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    message: "Account deleted"
  });
});



// Change authenticated user password
export const changePassword = asyncHandler(async (req, res) => {

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user){
    return res.status(404).json({
      message: "User not found"
    });
  }

  const match = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!match) {
    return res.status(400).json({
      message: "Wrong password"
    });
  }

  user.password = await bcrypt.hash(newPassword, 12);

  await user.save();

  res.status(200).json({
    message: "Password updated"
  });
});