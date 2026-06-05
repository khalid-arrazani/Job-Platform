import asyncHandler from "express-async-handler";

import RecruiterProfile, {
  validateRecruiterProfile
} from "../models/RecruiterProfile.js";



/* ======================
   RECRUITER PROFILE
====================== */



// Get authenticated recruiter profile
export const getRecruiterProfile = asyncHandler(async (req, res) => {

  const profile = await RecruiterProfile.findOne({
    userId: req.user.id
  });

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found"
    });
  }

  res.status(200).json(profile);
});



// Create recruiter profile for the first time
export const createRecruiterProfile = asyncHandler(async (req, res) => {

  const { error } = validateRecruiterProfile(req.body);

  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }

  // const allowedFields = [
  //   "fullName",
  //   "companyName",
  //   "companyDescription",
  //   "website",
  //   "industry",
  //   "location",
  //   "Companylocation",
  //   "headline"
  // ];


  // const data = {};

  // allowedFields.forEach((field) => {

  //   if (req.body[field] !== undefined) {
  //     data[field] = req.body[field];
  //   }
  // });

  // try {

  //   const profile = await RecruiterProfile.create({
  //     userId: req.user.id,
  //     ...data
  //   });

  //   res.status(201).json({
  //     success: true,
  //     message: "Profile created successfully",
  //     profile: profile,
  //   });

  // } catch (err) {

  //   if (err.code === 11000) {
  //     return res.status(400).json({
  //       message: "Profile already exists"
  //     });
  //   }

  //   throw err;
  // }
  
    const exists = await RecruiterProfile.findOne({
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
  
    const profile = await RecruiterProfile.create({
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



// Update authenticated recruiter profile
export const updateRecruiterProfile = asyncHandler(async (req, res) => {

  const { error } = validateRecruiterProfile(
    req.body,
    true
  );

  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }

  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: req.user.id },
    { $set: req.body },
    { new: true }
  );

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found"
    });
  }

  res.status(200).json(profile);
});