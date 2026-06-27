import asyncHandler from "express-async-handler";

import RecruiterProfile, {
  validateRecruiterProfile
} from "../models/RecruiterProfile.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";



/* ======================
   RECRUITER PROFILE
====================== */



// Get authenticated recruiter profile
export const getRecruiterProfile = asyncHandler(async (req, res) => {

  const profile = await RecruiterProfile.findOne({
    userId: req.user.id
  }).populate("userId", "email role isComplete").populate("company","name");;

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found"
    });
  }
  res.status(200).json({success: true,profile:profile, message: "get Profile successfully"});
});



// Create recruiter profile for the first time
export const createRecruiterProfile = asyncHandler(async (req, res) => {

  const { error } = validateRecruiterProfile(req.body);

  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }

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
    ProfileImage: {
      url: image.secure_url,
      public_id: image.public_id
    },
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


// Update Profile Photo
export const UpdatePhotoProfile = asyncHandler(async (req, res) => {

  const exists = await RecruiterProfile.findOne({
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

  const profile = await RecruiterProfile.findOneAndUpdate(
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
  const updateData = {
  ...req.body,
};

  const exists = await RecruiterProfile.findOne({
    userId: req.user.id
  });

if (req.file) {

  const image = await uploadToCloudinary(req.file.buffer);

  if (exists.ProfileImage.public_id) {
    await cloudinary.uploader.destroy(
      exists.ProfileImage.public_id
    );
  }

  updateData.companyLogo = {
    url: image.secure_url,
    public_id: image.public_id,
  };
}



  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: req.user.id },
    { $set: updateData },
    { new: true }
  ).populate("userId", "email role isComplete");


  if (!profile) {
    return res.status(404).json({
      message: "Profile not found"
    });
  }

    res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    profile: profile,
  });
});