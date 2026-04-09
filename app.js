import express from 'express';
import dotenv from "dotenv";
import loginRouter from "./routes/login.js";
dotenv.config();

const app = express();

app.use(express.json());

app.use("/login",loginRouter);


export default app;