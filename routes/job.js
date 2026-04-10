import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

import {protect} from "../middlewares/check.js"
import {recruiterOnly}"../middlewares/role.js"



router.get("/jobs", asyncHandler(protect,recruiterOnly,(req,res)=>{

}))