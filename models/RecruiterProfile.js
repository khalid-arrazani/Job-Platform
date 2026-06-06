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
      default: "Unknown",
    },

    location: {
      type: String,
      default: "Unknown",
    },

    aboutMe: {
      type: String,
      default: "Unknown",
    },

    experienceLevel: {
  type: String,
  enum: ["Entry Level", "Junior", "Mid Level", "Senior", "Lead"],
  default: "Entry Level",
},

    socialLinks: [
      {
        platform: String,
        url: String,
      }
    ],

    hiring_Focus: {

      hiring_Types: {
        type: [String],
        enum: [
          "Full-time",
          "Part-time",
          "Contract",
          "Internship",
          "Remote",
          "Hybrid",
          "Freelance"
        ],
        default: ["Full-time"],
      },

      roles_I_hire_for: {
        type: [String],
        default: [],
      },

    },





    companyName: {
      type: String,
      required: true,
      trim: true,
    },

      companyLogo: {
      url: {
        type: String,
        default: ""
      },
      public_id: {
        type: String,
        default: ""
      }
    },

    companyDescription: {
      type: String,
      default: "Unknown",
    },

    website: {
      type: String,
      default: "Unknown",
    },

    industry: {
      type: String,
      default: "Unknown",
    },

    Companylocation: {
      type: String,
      default: "Unknown",
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

    headline: Joi.string().min(3).max(400),

    ProfileImage: Joi.object({
      url: Joi.string().allow(""),
      public_id: Joi.string().allow("")
    }),

    aboutMe: Joi.string().default("Unknown"),

    experienceLevel: Joi.string()
    .valid(
      "Entry Level",
      "Junior",
      "Mid Level",
      "Senior",
      "Lead"
    )
    .default("Entry Level"),

  socialLinks: Joi.array().items(
    Joi.object({
      platform: Joi.string().required(),
      url: Joi.string().uri().required(),
    })
  ).default([]),

  hiring_Focus: Joi.object({
    hiring_Types: Joi.array()
      .items(
        Joi.string().valid(
          "Full-time",
          "Part-time",
          "Contract",
          "Internship",
          "Remote",
          "Hybrid",
          "Freelance"
        )
      )
      .default([]),

    roles_I_hire_for: Joi.array()
      .items(Joi.string())
      .default([]),
  }).default({}),
    companyName: Joi.string().min(2).max(150),

    companyDescription: Joi.string().allow("").max(1000),

    website: Joi.string().allow(""),

    industry: Joi.string().allow("").max(100),

    location: Joi.string().allow("").max(100),

    Companylocation: Joi.string().allow("").max(100),

    companyLogo: Joi.object({
      url: Joi.string().allow(""),
      public_id: Joi.string().allow("")
    }),
  });

  if (!isUpdate) {
    schema = schema.fork(
      ["fullName", "companyName"],
      (field) => field.required()
    );
  }
  return schema.validate(data);
};
const RecruiterProfile =
  mongoose.models.RecruiterProfile ||
  mongoose.model("RecruiterProfile", recruiterProfileSchema);

export default RecruiterProfile;