import mongoose from "mongoose";
import Joi from "joi";

/* ======================
   MONGOOSE MODEL
====================== */

const jobSeekerProfileSchema = new mongoose.Schema(
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

    bio: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: [
      {
        title: String,
        company: String,
        years: Number,
      },
    ],

    education: [
      {
        school: String,
        degree: String,
        year: Number,
      },
    ],

    location: {
      type: String,
      default: "",
    },

    cv: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);


/* ======================
JOI VALIDATION
====================== */

export const validateJobSeekerProfile = (data, isUpdate = false) => {
  let schema = Joi.object({
    fullName: Joi.string().min(3).max(100),

    bio: Joi.string().allow("").max(500),
    
    skills: Joi.array().items(Joi.string()),
    
    location: Joi.string().allow("").max(100),

    cv: Joi.string().allow(""),

    experience: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        company: Joi.string().required(),
        years: Joi.number().min(0),
      })
    ),

    education: Joi.array().items(
      Joi.object({
        school: Joi.string().required(),
        degree: Joi.string().required(),
        year: Joi.number(),
      })
    ),
  });
  
  // 👇 هنا الفرق
  if (!isUpdate) {
    schema = schema.fork(
      ["fullName"], 
      (field) => field.required()
    );
  }
  
  return schema.validate(data);
};

const JobSeekerProfile =mongoose.models.JobSeekerProfile || mongoose.model(
  "JobSeekerProfile",
  jobSeekerProfileSchema
);
export default JobSeekerProfile;