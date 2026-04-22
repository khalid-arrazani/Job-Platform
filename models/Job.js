import Joi from "joi";
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
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
},{timestamps:true})

export const validateJobsDetails = (job , isUpdate=false) => {
  let schema = Joi.object({
    title: Joi.string(),

    description: Joi.string(),

    location: Joi.string(),

    salary: Joi.number(),

    company: Joi.string(),

    jobType: Joi.string()
      .valid("full-time", "part-time", "remote", "internship"),

    experienceLevel: Joi.string()
      .valid("junior", "mid", "senior"),

    skills: Joi.array().items(Joi.string()) 
  });
     if (!isUpdate) {
    schema = schema.fork(
      ["title","description","location","company"], 
      (field) => field.required()
    );}
  return schema.validate(job);
};
const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job