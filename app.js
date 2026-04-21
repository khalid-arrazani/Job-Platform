import express from 'express';
import dotenv from "dotenv";
import connectDB from './config/db.js';
import authRouter from "./routes/auth.js";
import jobRouter from "./routes/job.js";
import jobSeekerProfileRoutes from "./routes/jobSeekerProfile.routes.js";
import recruiterProfileRoutes from "./routes/recruiterProfile.routes.js";


import recruiterRouter from "./routes/recruiter.js";
dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use("/",authRouter);

app.use("/list",jobRouter);

app.use("/api/jobseeker/profile", jobSeekerProfileRoutes);

app.use("/api/recruiter/profile", recruiterProfileRoutes);

app.use("/recruiter",recruiterRouter);

export default app;