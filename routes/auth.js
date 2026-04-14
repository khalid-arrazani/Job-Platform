import express from "express";
import User from "../models/User.js";
import { validateUserRegistration } from "../models/User.js";
const router = express.Router();
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import upload from "../middlewares/uploadCv.js";

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post(
  "/register",upload.single("cv"),
  asyncHandler(async (req, res) => {
    const { email, password, username, role } = req.body;

    const { error } = validateUserRegistration({ email, password, username });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      email,
      password,
      username,
      role,
      cv: req.file ? req.file.path : null,
      cvPublicId: req.file ? req.file.filename : null
    });
    const savedUser = await newUser.save();

    const userObj = savedUser.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = user.generateToken();

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite:"none"
      })
      .json({ message: "Login successful!" });
  }),
);

export default router;
