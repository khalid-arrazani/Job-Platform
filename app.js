import express from 'express';
import dotenv from "dotenv";
import connectDB from './config/db.js';
import authRouter from "./routes/auth.js";
dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use("/",authRouter);

export default app;