import asyncHandler from "express-async-handler";
import { Company, companyValidation } from "../models/Company.js";

import cloudinary from "../config/cloudinary.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import RecruiterProfile from "../models/RecruiterProfile.js";
import Apply from "../models/Apply.js";
import Job from "../models/Job.js";



/* ======================
   GET ALL COMPANIES
====================== */
export const getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find()
    .populate("owner", "email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    companies,
  });
});

/* ======================
   GET MY COMPANY
====================== */
export const getMyCompany = asyncHandler(async (req, res) => {

  const recruiter = await RecruiterProfile.findOne({
    userId: req.user.id,
  });

  if (!recruiter) {
    return res.status(404).json({
      success: false,
      message: "Recruiter profile not found",
    });
  }

  const company = await Company.findOne({
    owner: recruiter._id,
  }).populate({
    path: "owner", select: "fullName headline location",
    populate: {
      path: "userId",
      select: "email role isComplete",
    },
  });

  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  }

  res.status(200).json({
    success: true,
    company,
  });
});


/* ======================
   GET COMPANY BY ID
====================== */
export const getCompanyById = asyncHandler(async (req, res) => {

  const company = await Company.findByIdAndUpdate(req.params.id, { $inc: { companyViews: 1 } },
    { returnDocument: false }).populate(
      "owner",
    );

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  const jobs = await Job.find({ createdBy: company._id });

console.log(jobs);

  // Total Jobs
  const totalJobs = jobs.length;

  // Active Jobs
  const activeJobs = jobs.filter((job) => job.status === "active").length;

  // Total Applicants
  const applicants = await Apply.countDocuments({
     company: company._id,
  });

  // New Applicants 
  const sevenDaysAgo = new Date();
  console.log(sevenDaysAgo);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
console.log(sevenDaysAgo);
  const newApplicants = await Apply.countDocuments({
  Company: company._id,
  createdAt: { $gte: sevenDaysAgo },
});
 

  // Hired
  const hired = await Apply.countDocuments({
    Company: company._id,
    status: "hired",
  });

  res.status(200).json({
    success: true,
    company,
    hired,
    newApplicants,
    applicants,
    totalJobs,
    activeJobs
  });
});


/* ======================
   CREATE COMPANY (WITH JOI)
====================== */
export const createCompany = asyncHandler(async (req, res) => {

  if (req.body.benefits) {
    req.body.benefits = JSON.parse(req.body.benefits);
  }

  if (req.body.socialLinks) {
    req.body.socialLinks = JSON.parse(req.body.socialLinks);
  }

  const { error } = companyValidation(req.body);

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const exists = await Company.findOne({ owner: req.user.id });

  if (exists) {
    return res.status(400).json({
      message: "You already created a company",
    });
  }


  let logo = null;


  if (req.files?.companyLogo?.[0]) {
    logo = await uploadToCloudinary(req.files.companyLogo[0].buffer);
  }



  //bring Recruiter and add in it company id
  const recruiterProfile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });




  let companyBackground


  if (req.body.backgroundType === "banner") {

    companyBackground = {
      backgroundType: "banner",
      bannerId: Number(req.body.bannerId),
      url: "",
      public_id: "",
    };

  }
  if (
    req.body.backgroundType === "upload" &&
    req.files?.companyBackground?.length
  ) {
    const result = await uploadToCloudinary(
      req.files.companyBackground[0].buffer
    );

    companyBackground = {
      backgroundType: "upload",
      bannerId: null,
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  const company = await Company.create({
    ...req.body,
    owner: recruiterProfile._id,

    companyLogo: logo
      ? {
        url: logo.secure_url,
        public_id: logo.public_id,
      }
      : {
        url: "",
        public_id: "",
      },
    companyBackground,
  });



  recruiterProfile.company = company._id;
  await recruiterProfile.save();


  res.status(201).json({
    success: true,
    message: "Company created successfully",
    company
  });

});


/* ======================
   UPDATE COMPANY (WITH JOI)
====================== */
export const updateCompany = asyncHandler(async (req, res) => {
  const { error } = companyValidation(req.body);

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const company = await Company.findOne({ owner: req.user.id });

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  const updatedCompany = await Company.findByIdAndUpdate(
    company._id,
    { $set: req.body },
    { new: true }
  );


  res.status(200).json({

    success: true,
    message: "Company updated successfully",
    company: updatedCompany,
  });
});


/* ======================
   UPDATE COMPANY LOGO
====================== */
export const updateCompanyLogo = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user.id });

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: "Logo image is required",
    });
  }

  if (company.companyLogo?.public_id) {
    await cloudinary.uploader.destroy(company.companyLogo.public_id);
  }

  const logo = await uploadToCloudinary(req.file.buffer);

  const updated = await Company.findByIdAndUpdate(
    company._id,
    {
      companyLogo: {
        url: logo.secure_url,
        public_id: logo.public_id,
      },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Company logo updated successfully",
    company: updated,
  });
});


/* ======================
   DELETE COMPANY
====================== */
export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user.id });

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  if (company.companyLogo?.public_id) {
    await cloudinary.uploader.destroy(company.companyLogo.public_id);
  }

  await Company.findByIdAndDelete(company._id);

  res.status(200).json({
    success: true,
    message: "Company deleted successfully",
  });
});