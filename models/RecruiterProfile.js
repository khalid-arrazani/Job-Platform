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


/* ======================
JOI VALIDATION
====================== */

export const validateRecruiterProfile = (data, isUpdate = false) => {
  let schema = Joi.object({
    fullName: Joi.string().min(3).max(100),
    
    companyName: Joi.string().min(2).max(150),
    
    companyDescription: Joi.string().allow("").max(1000),
    
    website: Joi.string().uri().allow(""),
    
    industry: Joi.string().allow("").max(100),
    
    location: Joi.string().allow("").max(100),
  });

    if (!isUpdate) {
    schema = schema.fork(
      ["fullName","companyName"], 
      (field) => field.required()
    );
  }
  return schema.validate(data);
};
const RecruiterProfile =
  mongoose.models.RecruiterProfile ||
  mongoose.model("RecruiterProfile", recruiterProfileSchema);

export default RecruiterProfile;