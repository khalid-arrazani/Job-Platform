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
    ProfileImage:String,
    
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    Headline: {
      type: String,
      default: "",
    },
    aboutMe: {
      about: {
        type: String,
        default: "",
      },

      availability: {
        type: String,
        enum: [
          "immediately",
          "1_week",
          "1_month",
        ],
        default: "immediately",
      },

      languages: {
        type: [String],
        default: [],
      },

      experienceLevel: {
        type: String,
        enum: [
          "junior",
          "mid",
          "senior",
        ],
        default: "junior",
      },

      preferredJobType: {
        type: String,
        enum: [
          "full-time",
          "part-time",
          "remote",
          "internship",
          "freelance",
          "contract",
        ],
        default: "full-time",
      },
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
    socialLinks: [
      {
        platform: String,
        link: String,
      }
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

export const validateJobSeekerProfile = (
  data,
  isUpdate = false
) => {
  let schema = Joi.object({
    fullName: Joi.string()
      .min(3)
      .max(100),
      ProfileImage:Joi.string(),
    headline: Joi.string()
      .allow("")
      .max(120),

    aboutMe: Joi.object({
      about: Joi.string()
        .allow("")
        .max(500)
        .default(""),

      availability: Joi.string()
        .valid(
          "immediately",
          "1_week",
          "1_month"
        )
        .default("immediately"),

      languages: Joi.array()
        .items(Joi.string())
        .default([]),

      experienceLevel: Joi.string()
        .valid(
          "junior",
          "mid",
          "senior"
        )
        .default("junior"),

      preferredJobType: Joi.string()
        .valid(
          "full-time",
          "part-time",
          "remote",
          "internship",
          "freelance",
          "contract"
        )
        .default("full-time"),
    }),

    skills: Joi.array().items(
      Joi.string()
    ),

    socialLinks: Joi.array().items(
      Joi.object({
        platform: Joi.string().required(),

        link: Joi.string()
          .uri()
          .required(),
      })
    ),

    location: Joi.string()
      .allow("")
      .max(100),

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

  if (!isUpdate) {
    schema = schema.fork(
      ["fullName"],
      (field) => field.required()
    );
  }

  return schema.validate(data);
};

const JobSeekerProfile =
  mongoose.models.JobSeekerProfile ||
  mongoose.model(
    "JobSeekerProfile",
    jobSeekerProfileSchema
  );

export default JobSeekerProfile;