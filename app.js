import express from 'express';
import dotenv from "dotenv";
dotenv.config();


import connectDB from './config/db.js';

import authRouter from "./routes/auth.js";
import jobRouter from "./routes/job.js";

import jobSeekerProfile from "./routes/jobseekerProfile.js";
import recruiterProfile from "./routes/recruiterProfile.js";

import userRouter from "./routes/user.js";
import apply from './routes/apply.js';


const app = express();

connectDB();

app.use(express.json());

app.use("/",authRouter);

app.use("/list",jobRouter);

app.use("/api/jobseeker/profile", jobSeekerProfile);

app.use("/api/recruiter/profile", recruiterProfile);

app.use("/api/user",userRouter);

app.use("/api/apply",apply);

export default app;