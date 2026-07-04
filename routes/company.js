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
  getMyCompany,
  updateCompanyBanner,
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
   GET MY COMPANY
====================== */

router.get(
  "/my-company",
  protect,
  recruiterOnly,
  getMyCompany
)


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
   UPDATE COMPANY BANNER
====================== */
router.put(
  "/banner",
  protect,
  recruiterOnly,
  uploadImage,
  updateCompanyBanner
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