import asyncHandler from "express-async-handler";
import { Company, companyValidation } from "../models/Company.js";
import cloudinary from "../config/cloudinary.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";


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
   GET COMPANY BY ID
====================== */
export const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).populate(
    "owner",
    "email role"
  );

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  res.status(200).json({
    success: true,
    company,
  });
});


/* ======================
   CREATE COMPANY (WITH JOI)
====================== */
export const createCompany = asyncHandler(async (req, res) => {
  console.log(1);
  console.log(req.body.benefits);


 if (req.body.benefits) {
  req.body.benefits = JSON.parse(req.body.benefits);
}
console.log(typeof req.body.benefits);
if (req.body.socialLinks) {
  req.body.socialLinks = JSON.parse(req.body.socialLinks);
}

  const { error } = companyValidation(req.body);

  console.log(2);

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
  console.log(3);

  let logo = null;
  let background = null;

  if (req.files?.companyLogo?.[0]) {
    logo = await uploadToCloudinary(req.files.companyLogo[0].buffer);
  }
  console.log(4);

  if (req.files?.companyBackground?.[0]) {
    background = await uploadToCloudinary(
      req.files.companyBackground[0].buffer
    );
  }
  console.log(5);

  const company = await Company.create({
    ...req.body,
    owner: req.user.id,

    companyLogo: logo
      ? {
        url: logo.secure_url,
        public_id: logo.public_id,
      }
      : {
        url: "",
        public_id: "",
      },

    companyBackground: background
      ? {
        url: background.secure_url,
        public_id: background.public_id,
      }
      : {
        url: "",
        public_id: "",
      },
  });
  console.log(6);

  res.status(201).json({
    success: true,
    message: "Company created successfully",
    company,
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