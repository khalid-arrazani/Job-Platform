import express from 'express';
import dotenv from "dotenv";
dotenv.config();


import connectDB from './config/db.js';

import authRouter from "./routes/auth.js";
import jobRouter from "./routes/job.js";

import jobSeekerProfileRouter from "./routes/jobseekerProfile.js";
import recruiterProfileRouter from "./routes/recruiterProfile.js";

import userRouter from "./routes/user.js";
import applyRouter from './routes/apply.js';


const app = express();

connectDB();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/jobs", jobRouter);

app.use("/api/jobseeker", jobSeekerProfileRouter);
app.use("/api/recuiter", recruiterProfileRouter);

app.use("/api/users", userRouter);
app.use("/api/applications", applyRouter);

export default app;