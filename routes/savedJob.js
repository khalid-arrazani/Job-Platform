import express from "express";

import { protect } from "../middlewares/check.js";
import { toggleSaveJob,getSavedJobs } from "../controllers/savedJobController.js";


const router = express.Router();


router.post("/jobs/save", protect, toggleSaveJob);

router.get("/jobs/save/:page", protect, getSavedJobs);

export default router;