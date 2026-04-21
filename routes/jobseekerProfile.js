import express from "express";
const router = express.Router();
import asyncHandler from "express-async-handler";
import { protect } from "../middlewares/check.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import { validateJobSeekerProfile } from "../models/JobSeekerProfile.js";
import authorizeRoles from "../middlewares/authorizeApply.js";

/* ======================
   JOB SEEKER PROFILE
====================== */

//get my profile for jobSeeker
router.get(
  "/me",
  protect,
  authorizeRoles("jobSeeker"),
  asyncHandler(async (req, res) => {
    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  })
);


// add profile for the first time for jobSeeker
router.post(
  "/",
  protect,
    authorizeRoles("jobSeeker"),
  asyncHandler(async (req, res) => {
    const { error } = validateJobSeekerProfile(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const exists = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (exists) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await JobSeekerProfile.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json(profile);
  })
);


// update profile for jobSeeker
router.patch(
  "/me",
  protect,
    authorizeRoles("jobSeeker"),
  asyncHandler(async (req, res) => {
 
    const { error } = validateJobSeekerProfile(req.body, true);

    if (error) return res.status(400).json({ message: error.message });

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
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  })
);



export default router;