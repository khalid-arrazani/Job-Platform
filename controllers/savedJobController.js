import SavedJob, { saveJobValidator } from "../models/SavedJob.js";


// SAVE / UNSAVE TOGGLE
export const toggleSaveJob = async (req, res) => {
    
  try {
    const { error } = saveJobValidator(req.body);
    
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const userId = req.user.id; 
    const jobId = req.body.jobId;

    const existing = await SavedJob.findOne({
      user: userId,
      job: jobId,
    });
 
    // If already saved → UNSAVE
    if (existing) {
      await SavedJob.deleteOne({ _id: existing._id });

      return res.status(200).json({
        saved: false,
        message: "Job removed from saved list",
      });
    }
 
    // If not saved → SAVE
    const saved = await SavedJob.create({
      user: userId,
      job: jobId,
    });
    
    return res.status(201).json({
      saved: true,
      message: "Job saved successfully",
      data: saved,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


//get all saved job

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. find all saved jobs for this user
    const savedJobs = await SavedJob.find({ user: userId })
      .populate({
        path: "job",
        populate: {
          path: "createdBy",
        },
      });

    // 2. clean data + add isSaved flag
    const jobs = savedJobs
      .filter((item) => item.job) // safety check
      .map((item) => ({
        ...item.job._doc,
        isSaved: true,
      }));

    // 3. response
    return res.status(200).json({
      count: jobs.length,
      jobs,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};