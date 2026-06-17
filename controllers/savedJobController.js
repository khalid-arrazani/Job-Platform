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

    const page = Number(req.params.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // total count
    const totalSavedJobs = await SavedJob.countDocuments({
      user: userId,
    });

    // paginated data
    const savedJobs = await SavedJob.find({ user: userId })
      .populate({
        path: "job",
        populate: {
          path: "createdBy",
        },
      })
      .sort({ createdAt: -1 }) // latest saved first
      .skip(skip)
      .limit(limit);

    const jobs = savedJobs
      .filter((item) => item.job)
      .map((item) => ({
        ...item.job._doc,
        isSaved: true,
      }));

    return res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalSavedJobs / limit),
      totalSavedJobs,
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