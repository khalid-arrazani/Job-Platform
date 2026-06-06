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

    ProfileImage: {
      url: {
        type: String,
        default: ""
      },
      public_id: {
        type: String,
        default: ""
      }
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    headline: {
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
        period: String,
      },
    ],

    education: [
      {
        school: String,
        degree: String,
        period: String,
      },
    ],

    socialLinks: [
      {
        platform: String,
        url: String,
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
      .max(50),

    ProfileImage: Joi.object({
      url: Joi.string().allow(""),
      public_id: Joi.string().allow("")
    }),

    headline: Joi.string()
      .allow("")
      .max(120),

    aboutMe: Joi.object({
      about: Joi.string()
        .allow("")
        .max(700)
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

        url: Joi.string()
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
        period: Joi.string()
      })
    ),

    education: Joi.array().items(

      Joi.object({
        school: Joi.string().required(),
        degree: Joi.string().required(),
        period: Joi.string(),
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