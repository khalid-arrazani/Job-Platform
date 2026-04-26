import mongoose from "mongoose";
import Joi, { date } from "joi";

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
    emailVerified: { type: Boolean, default: false },

    verificationCode: String,
    verificationCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetCode: String,
    sentAt:Date,

    resetCodeExpire: Date,
    refreshTokens: [
      {
        token: String,
        createdAt: Date,
        device: String,
        expiresAt:Date
      }
    ]
  },
  { timestamps: true },
);
userSchema.methods.generateToken = function () {

  const accessToken = jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };

};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export const validateUserRegistration = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(124).required(),
    role: Joi.string().trim().valid("jobSeeker", "recruiter").default("jobSeeker"),
    cv: Joi.string(),
    cvPublicId: Joi.string(),
    verificationCode: Joi.string(),
    sentAt:Joi.date(),
    verificationCodeExpires: Joi.date(),
    emailVerified:Joi.boolean(),
    resetPasswordToken: Joi.string(),
    resetPasswordExpires: Joi.date(),
    refreshTokens: Joi.array().items(
      Joi.object({
        token: Joi.string().required(),
        createdAt: Joi.date().required(),
        device: Joi.string().required(),
        expiresAt : Joi.date().required()
      })
    ),
  });
  return schema.validate(user);
};
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User
