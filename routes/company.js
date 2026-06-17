import express from "express";

const router = express.Router();

import { protect } from "../middlewares/check.js";
import { recruiterOnly } from "../middlewares/role.js";

import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  updateCompanyLogo,
  deleteCompany,
} from "../controllers/companyController.js";

import { uploadImage } from "../middlewares/Multer.js";


/* ======================
   GET ALL COMPANIES
====================== */
router.get(
  "/",
  protect,
  getAllCompanies
);


/* ======================
   GET COMPANY BY ID
====================== */
router.get(

  
  "/:id",
  protect,
  getCompanyById
);


/* ======================
   CREATE COMPANY
====================== */
router.post(
  "/",
  protect,
  recruiterOnly,
  uploadImage,
  createCompany
);


/* ======================
   UPDATE COMPANY (PUT)
====================== */
router.put(
  "/me",
  protect,
  recruiterOnly,
  updateCompany
);


/* ======================
   UPDATE COMPANY LOGO
====================== */
router.put(
  "/logo",
  protect,
  recruiterOnly,
  uploadImage,
  updateCompanyLogo
);


/* ======================
   DELETE COMPANY
====================== */
router.delete(
  "/me",
  protect,
  recruiterOnly,
  deleteCompany
);

export default router;