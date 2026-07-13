import asyncHandler from "express-async-handler";
import { Company, companyValidation, updateCompanyValidation } from "../models/Company.js";

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

  const jobs = await Job.find({ createdBy: company._id });

  // Total Jobs
  const totalJobs = jobs.length;

  // Active Jobs

  const activeJobs = jobs.filter((job) => job.status === "active");
  const totalActiveJobs = activeJobs.length
  // Total Applicants
  const applicants = await Apply.countDocuments({
    company: company._id,
  });

  // New Applicants 
  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);


  const newApplicants = await Apply.countDocuments({
    company: company._id,
    createdAt: { $gte: sevenDaysAgo },
  });


  // Hired
  const hired = await Apply.countDocuments({
    company: company._id,
    status: "hired",
  });
  const companyViews = company.companyViews

  res.status(200).json({
    success: true,
    company,
    hired,
    newApplicants,
    applicants,
    totalJobs,
    activeJobs,
    companyViews,
    totalActiveJobs
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

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newApplicants = await Apply.countDocuments({
    company: company._id,
    createdAt: { $gte: sevenDaysAgo },
  });


  // Hired
  const hired = await Apply.countDocuments({
    company: company._id,
    status: "hired",
  });
  const companyViews = company.companyViews

  res.status(200).json({
    success: true,
    company,
    hired,
    newApplicants,
    applicants,
    totalJobs,
    activeJobs,
    companyViews
  });
});


/* ======================
   CREATE COMPANY 
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

  const recruiterProfile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });
  if (!recruiterProfile) {
    return res.status(400).json({
      message: "Profile not found ",
    });
  }

  const exists = await Company.findOne({ owner: recruiterProfile._id });

  if (exists) {
    return res.status(400).json({
      message: "You already created a company",
    });
  }


  let logo = null;

  if (req.files?.companyLogo?.[0]) {
    logo = await uploadToCloudinary(req.files.companyLogo[0].buffer);
  }



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
  const { error } = updateCompanyValidation(req.body);
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  };

  

  const recruiterProfile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });

  const company = await Company.findOne({ owner: recruiterProfile.id });

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  };
  

  const updatedCompany = await Company.findByIdAndUpdate(
    company._id,
    { $set: req.body },
    { returnDocument: 'after'}
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

 const recruiterProfile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });

  if (!recruiterProfile) {
    return res.status(400).json({
      message: "Profile not found ",
    });
  }

  const company = await Company.findOne({ owner: recruiterProfile._id });

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  if (!req.files?.companyLogo?.[0]) {
    return res.status(400).json({
      message: "Logo image is required",
    });
  }

  //if there is old company logo delete it before add new logo

  if (company.companyLogo?.public_id) {
    await cloudinary.uploader.destroy(company.companyLogo.public_id);
  }

  const logo = await uploadToCloudinary(req.files?.companyLogo?.[0].buffer);

  const updated = await Company.findByIdAndUpdate(
    company._id,
    {
      companyLogo: {
        url: logo.secure_url,
        public_id: logo.public_id,
      },
    },
    {returnDocument: "after"}
  );

  res.status(200).json({
    success: true,
    message: "Company logo updated successfully",
  });
});


/* ======================
   UPDATE COMPANY BANNER
====================== */
export const updateCompanyBanner = asyncHandler(async (req, res) => {
const recruiterProfile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });
  if (!recruiterProfile) {
    return res.status(404).json({
      message: "Recruiter Profile not found",
    });
  }

  const company = await Company.findOne({owner: recruiterProfile._id});

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  if (req.body.backgroundType === "upload" && !req.files?.companyBackground?.[0] || req.body.backgroundType === "banner" &&
    req.body.bannerId == null) {
    return res.status(400).json({
      message: "Banner image is required",
    });
  }

  let companyBackground

  if (req.body.backgroundType === "banner") {

    if (Number(req.body.bannerId) === Number(company.companyBackground.bannerId)) {
      return res.status(400).json({
        message: "You need to change the banner before save",
      });
    }


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

  if (company.companyBackground?.public_id) {
    await cloudinary.uploader.destroy(company.companyBackground?.public_id);
    console.log("this mf is destroy");
  }

  const updated = await Company.findByIdAndUpdate(
    company._id,
    {
     companyBackground
    },
    {returnDocument: "after"}
  );

  res.status(200).json({
    success: true,
    message: "Company Banner updated successfully",
  });
});


/* ======================
   Delete COMPANY BANNER
====================== */
export const deleteCompanyBanner = asyncHandler(async (req, res) => {
const recruiterProfile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });
  if (!recruiterProfile) {
    return res.status(404).json({
      message: "Recruiter Profile not found",
    });
  }
  const company = await Company.findOne({owner: recruiterProfile._id});

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  let companyBackground = {
      backgroundType: "banner",
      bannerId: null,
      url: "",
      public_id: "",
    };

  if (company.companyBackground?.public_id) {
    await cloudinary.uploader.destroy(company.companyBackground?.public_id);
  }

  const updated = await Company.findByIdAndUpdate(
    company._id,
    {
     companyBackground
    },
    {returnDocument: "after"}
  );

  res.status(200).json({
    success: true,
    message: "Company Banner deleted successfully",
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