import express from 'express';
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";

import connectDB from './config/db.js';

import authRouter from "./routes/auth.js";
import jobRouter from "./routes/job.js";

import jobSeekerProfileRouter from "./routes/jobseekerProfile.js";
import recruiterProfileRouter from "./routes/recruiterProfile.js";

import userRouter from "./routes/user.js";
import applyRouter from './routes/apply.js';


import cookieParser from "cookie-parser";
import savedJob from './routes/savedJob.js';
import companyRouter from "./routes/company.js";


const app = express();

connectDB();

app.use(
  cors({
    origin:
      "http://localhost:5173",

    credentials: true,
  })
);

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/jobs", jobRouter);
// Saved Jobs routes
app.use("/api/savedJob", savedJob);

app.use("/api/jobseeker", jobSeekerProfileRouter);
app.use("/api/recuiter", recruiterProfileRouter);
app.use("/api/company", companyRouter);


app.use("/api/users", userRouter);
app.use("/api/applications", applyRouter);

export default app;