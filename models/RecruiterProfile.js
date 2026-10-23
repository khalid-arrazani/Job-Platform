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
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    aboutMe: {
      type: String,
      default: "",
    },

    socialLinks: [
      {
        platform: String,
        url: String,
      }
    ],

    website: {
      type: String,
      default: "",
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      unique: true,
      default: null,
    },

    professionalTitle: {
      type: [String],
      default: [],
    },

    languages: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    hiring_Focus: {

      jobCategoriesList: {
        type: [String],
        default: [],
      },
      rolesList: {
        type: [String],
        default: [],
      },
      experienceLevelsList: {
        type: [String],
        default: [],
      },
      employmentTypesList: {
        type: [String],
        default: [],
      },
      workArrangementsList: {
        type: [String],
        default: [],
      },
      preferredSkillsList: {
        type: [String],
        default: [],
      },
      aboutHiringfocus: {
        type: String, trim: true,
        default: "",
      },

    },

    experiences: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: 60,
        },
        company_Name: {
          type: String,
          required: true,
          trim: true,
          maxlength: 40,
        },
        employment_Type: {
          type: String,
          default: "",
        },
        location: {
          type: String,
          default: "",
          trim: true,
          maxlength: 80,
        },
        start_Date: {
          type: String,
          required: true,
        },
        end_Date: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
          trim: true,
          maxlength: 500,
        },
      },
    ],

    experiences: [
      {
        degree: {
          type: String,
          required: true,
          trim: true,
          maxlength: 60,
        },
        school: {
          type: String,
          required: true,
          trim: true,
          maxlength: 40,
        },
        field_Of_Study: {
          type: String,
          default: "",
        },
        location: {
          type: String,
          default: "",
          trim: true,
          maxlength: 80,
        },
        start_Date: {
          type: String,
          required: true,
        },
        end_Date: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
          trim: true,
          maxlength: 500,
        },
      },
    ],

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

    aboutMe: Joi.string().default("").allow(""),

    socialLinks: Joi.array().items(
      Joi.object({
        platform: Joi.string().required(),
        url: Joi.string().uri().required(),
      })
    ).default([]),

    hiring_Focus: Joi.object({

      jobCategoriesList: Joi.array()
        .items(Joi.string().trim())
        .default([]),

      rolesList: Joi.array()
        .items(Joi.string().trim())
        .default([]),

      experienceLevelsList: Joi.array()
        .items(Joi.string().trim())
        .default([]),

      employmentTypesList: Joi.array()
        .items(Joi.string().trim())
        .default([]),

      workArrangementsList: Joi.array()
        .items(Joi.string().trim())
        .default([]),

      preferredSkillsList: Joi.array()
        .items(Joi.string().trim())
        .default([]),

      aboutHiringfocus: Joi.string()
        .trim()
        .allow("")
        .default(""),
    }).default({}),

    experiences: Joi.array().items(
      Joi.object({
        title: Joi.string().trim().max(30).required(),

        company_Name: Joi.string().trim().max(30).required(),

        employment_Type: Joi.string().allow("").default(""),

        location: Joi.string().trim().max(40).allow("").default(""),

        start_Date: Joi.string().required(),

        end_Date: Joi.string().allow("").default(""),

        description: Joi.string().trim().max(500).allow("").default(""),
      })
    ).default([]),

    education: Joi.array().items(
      Joi.object({
        degree: Joi.string().trim().max(30).required(),

        school: Joi.string().trim().max(30).required(),

        field_Of_Study: Joi.string().allow("").default(""),

        location: Joi.string().trim().max(40).allow("").default(""),

        start_Date: Joi.string().required(),

        end_Date: Joi.string().allow("").default(""),

        description: Joi.string().trim().max(500).allow("").default(""),
      })
    ).default([]),

    skills: Joi.array()
      .items(Joi.string().trim())
      .default([]),

    languages: Joi.array()
      .items(Joi.string().trim())
      .default([]),

    professionalTitle: Joi.array()
      .items(Joi.string().trim())
      .default([]),

    location: Joi.string().allow("").max(100),
    website: Joi.string().allow(""),



  });

  if (!isUpdate) {
    schema = schema.fork(
      ["fullName", "headline", "location"],
      (field) => field.required()
    );
  }
  return schema.validate(data);
};
const RecruiterProfile =
  mongoose.models.RecruiterProfile ||
  mongoose.model("RecruiterProfile", recruiterProfileSchema);

export default RecruiterProfile;