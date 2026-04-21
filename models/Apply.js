import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    cv: String,
    cvPublicId: String
  },
  { timestamps: true }
);
const Apply = mongoose.models.Apply || mongoose.model("Application", ApplicationSchema);
export default  Apply