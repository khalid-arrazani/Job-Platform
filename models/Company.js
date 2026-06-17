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
    companyLogo: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
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

    socialLinks: [
      {
        platform: String,
        url: String,
      }
    ],

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
  name: Joi.string().trim().min(2).max(100).required(),

  description: Joi.string().trim().min(20).max(2000).required(),

  industry: Joi.string().trim().required(),

  companySize: Joi.string()
    .valid("1-10", "11-50", "51-200", "201-500", "501-1000", "1000+")
    .required(),

  website: Joi.string().uri().allow(""),

  location: Joi.string().trim().required(),

  foundedYear: Joi.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear()),

  specialties: Joi.array().items(Joi.string().trim()),

  benefits: Joi.array().items(Joi.string().trim()),

  companyLogo: Joi.object({
    url: Joi.string().allow(""),
    public_id: Joi.string().allow(""),
  }),

  socialLinks: Joi.array().items(
    Joi.object({
      platform: Joi.string().required(),
      url: Joi.string().uri().allow("").required(),
    })
  ).optional(),

  owner: Joi.string().hex().length(24).required(),
});