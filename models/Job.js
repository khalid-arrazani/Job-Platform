import Joi from "joi";
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({


  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  title: {
    type: String,
    required: true
  },
jobViews: {
      type: Number,
      default: 0,
    },
  description: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  minSalary: {
    type: Number,
    required: true,
    min: 0,
  },

  maxSalary: {
    type: Number,
    required: true,
    min: 0,
  },

  salaryCurrency: {
    type: String,
    required: true,
    default: "USD",
  },

  salaryPeriod: {
    type: String,
    enum: ["Per Month", "Per Year"],
    default: "Per Year",
  },

  jobType: {
    type: String,
    enum: [
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
      "Freelance",
      "Temporary"
    ],
    default: "Full-time"
  },

  status: {
    type: String,
    enum: ["active", "closed", "draft"],
    default: "draft",
  },


  workMode: {
    type: String,
    enum: [
      "Remote",
      "Hybrid",
      "On-site"
    ],
    default: "On-site"
  },


  experienceLevel: {
    type: String,
    enum: ["Junior", "Mid", "Senior"],
    default: "Junior"
  },

  skills: [String],

}, { timestamps: true })

export const validateJobsDetails = (job, isUpdate = false) => {
  let schema = Joi.object({
    title: Joi.string(),

    description: Joi.string(),

    location: Joi.string(),

    minSalary: Joi.number().min(0),

    maxSalary: Joi.number()
      .min(0)
      .when("minSalary", {
        is: Joi.exist(),
        then: Joi.number().greater(Joi.ref("minSalary")),
      }),

    salaryCurrency: Joi.string(),

    salaryPeriod: Joi.string().valid(
      "Per Month",
      "Per Year"
    ),

    jobType: Joi.string()
      .valid("Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Freelance",
        "Temporary"),

    workMode: Joi.string()
      .valid("Remote",
        "Hybrid",
        "On-site"),

    experienceLevel: Joi.string()
      .valid("Junior", "Mid", "Senior"),

    status: Joi.string()
      .valid("active", "closed", "draft"),

    skills: Joi.array().items(Joi.string())
  });
  if (!isUpdate) {
    schema = schema.fork(
      ["title", "description", "location"],
      (field) => field.required()
    );
  }
  return schema.validate(job);
};
const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job