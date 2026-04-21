import mongoose from "mongoose";
import Joi from "joi";

/* ======================
   MONGOOSE MODEL
====================== */

const recruiterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyDescription: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    industry: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const RecruiterProfile = mongoose.model(
  "RecruiterProfile",
  recruiterProfileSchema
);

/* ======================
   JOI VALIDATION
====================== */

export const validateRecruiterProfile = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),

    companyName: Joi.string().min(2).max(150).required(),

    companyDescription: Joi.string().allow("").max(1000),

    website: Joi.string().uri().allow(""),

    industry: Joi.string().allow("").max(100),

    location: Joi.string().allow("").max(100),
  });

  return schema.validate(data);
};

export default RecruiterProfile;