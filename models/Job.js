import Joi from "joi";
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
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
    type: Number
  },

  company: {
    type: String,
    required: true
  },

  jobType: {
    type: String,
    enum: ["full-time", "part-time", "remote", "internship"],
    default: "full-time"
  },

  experienceLevel: {
    type: String,
    enum: ["junior", "mid", "senior"],
    default: "junior"
  },

  skills: [String], 

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
},{timestamps:true})

export const validateJobsDetails = (job) => {
  const schema = Joi.object({
    title: Joi.string().required(),

    description: Joi.string().required(),

    location: Joi.string().required(),

    salary: Joi.number(),

    company: Joi.string().required(),

    jobType: Joi.string()
      .valid("full-time", "part-time", "remote", "internship"),

    experienceLevel: Joi.string()
      .valid("junior", "mid", "senior"),

    skills: Joi.array().items(Joi.string()) 
  });

  return schema.validate(job);
};
const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job