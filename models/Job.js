import Joi from "joi";
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({


  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecruiterProfile",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  salary: {
    type: Number,
    required: true
  },
  salaryCurrency: {
    type: String,
    required: true
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

    salary: Joi.number(),
    salaryCurrency: Joi.string(),

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

    skills: Joi.array().items(Joi.string())
  });
  if (!isUpdate) {
    schema = schema.fork(
      ["title", "description", "location" ],
      (field) => field.required()
    );
  }
  return schema.validate(job);
};
const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job