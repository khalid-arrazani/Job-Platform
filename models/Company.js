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

    company_number: {
      type: String,
      required: true,
      trim: true,
    },


    companyLogo: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    companyBackground: {
      backgroundType: {
        type: String,
        enum: ["banner", "upload"],
        required: true
      },

      bannerId: {
        type: Number,
        default: null,
      },

      url: {
        type: String,
        default: "",
      },

      public_id: {
        type: String,
        default: "",
      },
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

    },

    website: {
      type: String,
      default: "",
    },
    company_email: {
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

export const companyValidation = (data) => {
  return Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),

    description: Joi.string().trim().min(20).max(2000).required(),

    company_number: Joi.string().trim().min(4).max(20).required(),

    industry: Joi.string().trim().required(),

    company_email: Joi.string().trim().email().required(),

    companySize: Joi.string().valid(
      "1-10",
      "11-50",
      "51-200",
      "201-500",
      "501-1000",
      "1000+"
    ),

    website: Joi.string().uri().allow(""),

    location: Joi.string().trim().required(),

    foundedYear: Joi.number()
      .integer()
      .min(1800)
      .max(new Date().getFullYear()),

    specialties: Joi.array().items(Joi.string().trim()),

    benefits: Joi.array().items(Joi.string().trim()),

    companyLogo: Joi.object({
      url: Joi.string().allow("").default(""),
      public_id: Joi.string().allow("").default(""),
    }).optional(),

    backgroundType: Joi.string()
      .valid("banner", "upload"),

      bannerId: Joi.string(),



    companyBackground: Joi.object({
      type: Joi.string()
        .valid("banner", "upload")
        .required(),

      bannerId: Joi.number()
        .allow(null)
        .default(null),

      url: Joi.string()
        .allow("")
        .default(""),

      public_id: Joi.string()
        .allow("")
        .default(""),
    }),

    socialLinks: Joi.array().items(
      Joi.object({
        platform: Joi.string().trim().required(),
        url: Joi.string().uri().optional().allow(""),
      })
    ).optional(),

  }).validate(data);
};