import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import RecruiterProfile from "../models/recruiterProfile.js";

import Job from "../models/Job.js";
import Apply from "../models/Apply.js";

import bcrypt from "bcryptjs";
import { protect } from "../middlewares/check.js";


const router = express.Router();

// get my profile for jobSeeker and recruiter
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  })
);


// update my profile for jobSeeker and recruiter
router.patch(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const allowedFields = ["username", "email"];

    const data = {};

    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) {
        data[f] = req.body[f];
      }
    });

    const isEmailTaken = await User.findOne({ email: data.email, _id: { $ne: req.user.id } });
    if (isEmailTaken) {
      return res.status(400).json({ message: "Email already in use" });
    };


    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: data },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  })
);

// delete my account for jobSeeker and recruiter
router.delete(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await JobSeekerProfile.findOneAndDelete({ userId: req.user.id });
    await RecruiterProfile.findOneAndDelete({ userId: req.user.id });
    await Job.deleteMany({ createdBy: req.user.id });
    await Apply.deleteMany({ applicant: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted" });
  })
);

//change password for jobSeeker and recruiter
router.post(
  "/change-password",
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Password updated" });
  })
);


export default router;