import mongoose from "mongoose";
import Joi from "joi";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    industry: {
      type: String,
      required: true,
      trim: true,
    },

    companySize: {
      type: String,
      enum: [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1000+",
      ],
      required: true,
    },

    website: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    foundedYear: {
      type: Number,
    },

    specialties: [
      {
        type: String,
        trim: true,
      },
    ],

    benefits: [
      {
        type: String,
        trim: true,
      },
    ],

    socialLinks: {
      linkedin: {
        type: String,
        default: "",
      },

      facebook: {
        type: String,
        default: "",
      },

      twitter: {
        type: String,
        default: "",
      },

      instagram: {
        type: String,
        default: "",
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruiterProfile",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model("Company", companySchema);

export const companyValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  description: Joi.string()
    .trim()
    .min(20)
    .max(2000)
    .required(),

  industry: Joi.string()
    .trim()
    .required(),

  companySize: Joi.string()
    .valid(
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1000+"
    )
    .required(),

  website: Joi.string()
    .uri()
    .allow(""),

  location: Joi.string()
    .trim()
    .required(),

  foundedYear: Joi.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear()),

  specialties: Joi.array().items(
    Joi.string().trim()
  ),

  benefits: Joi.array().items(
    Joi.string().trim()
  ),

  socialLinks: Joi.object({
    linkedin: Joi.string().uri().allow(""),
    facebook: Joi.string().uri().allow(""),
    twitter: Joi.string().uri().allow(""),
    instagram: Joi.string().uri().allow(""),
  }),

  owner: Joi.string()
    .hex()
    .length(24)
    .required(),
});