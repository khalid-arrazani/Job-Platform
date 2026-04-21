import mongoose from "mongoose";
import Joi, { ref } from "joi";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    cv: String,
    cvPublicId: String,

    role: {
      type: String,
      enum: ["jobSeeker", "recruiter"],
      default: "jobSeeker",


    },
    isVerified: { type: Boolean, default: false },

    verificationCode: String,
    verificationCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetCode: String,

    resetCodeExpire: Date,
    refreshTokens: [
      {
        token: String,
        createdAt: Date,
        device: String
      }
    ]
  },
  { timestamps: true },
);
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, isAdmin: this.isAdmin, role: this.role }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" })
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const validateUserRegistration = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(124).required(),
    role: Joi.string().valid("jobSeeker", "recruiter").default("jobSeeker"),
    cv: Joi.string(),
    cvPublicId: Joi.string(),
    verificationCode: Joi.string(),
    verificationCodeExpires: Joi.date(),
    resetPasswordToken: Joi.string(),
    resetPasswordExpires: Joi.date(),
    refreshTokens: Joi.array().items(
      Joi.object({
        token: Joi.string().required(),
        createdAt: Joi.date().required(),
        device: Joi.string().required()
      })
    ),
  });
  return schema.validate(user);
};

export default mongoose.model("User", userSchema);
