import express from "express";
import asyncHandler from "express-async-handler";
import RecruiterProfile, { validateRecruiterProfile } from "../models/RecruiterProfile.js";
import { protect } from "../middlewares/check.js";
import { recruiterOnly } from "../middlewares/role.js";
const router = express.Router();
/* ======================
   RECRUITER PROFILE
====================== */




// get my profile for recruiter
router.get(
  "/me",
  protect,
  recruiterOnly,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }
    const profile = await RecruiterProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  })
);



// add profile for the first time for recruiter
router.post(
  "/",
  protect,
    recruiterOnly,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { error } = validateRecruiterProfile(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const allowedFields = [
      "fullName",
      "companyName",
      "companyDescription",
      "website",
      "industry",
      "location"
    ];

    const data = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });

    try {
      const profile = await RecruiterProfile.create({
        userId: req.user.id,
        ...data,
      });

      res.status(201).json(profile);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: "Profile already exists" });
      }
      throw err;
    }
  })
);


// update profile for recruiter
router.put(
  "/me",
  protect,
  asyncHandler(async (req, res) => {

    if (req.user.role !== "recruiter") {
     return res.status(403).json({ message: "Access denied" });
    }
    const { error } = validateRecruiterProfile(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const profile = await RecruiterProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  })
);


 

export default router;