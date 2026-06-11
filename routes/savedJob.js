import express from "express";

import { protect } from "../middlewares/check.js";
import { toggleSaveJob } from "../controllers/savedJobController.js";


const router = express.Router();


router.post("/jobs/save", protect, toggleSaveJob);

export default router;