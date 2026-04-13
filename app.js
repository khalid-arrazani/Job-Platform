import express from 'express';
import dotenv from "dotenv";
import connectDB from './config/db.js';
import authRouter from "./routes/auth.js";
import jobRouter from "./routes/job.js";
dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use("/",authRouter);

app.use("/list",jobRouter);

export default app;