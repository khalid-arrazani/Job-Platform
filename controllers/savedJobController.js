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

// export const getSavedJobs = async (req, res) => {
//   try {

//     const userId = req.user.id;

//     const page = parseInt(req.query.page) || 1;
//     const limit = 5;
//     const skip = (page - 1) * limit;

//     const search = req.query.search || ""
//     const sort = req.query.sort == "Newest First" ? -1 : req.query.sort == "Oldest First" ? 1 : 1

//     // total count
//     const allsavedJobs = await SavedJob.find({ user: userId })
//       .populate({
//         path: "job",
//         ...(search && {
//           match: {
//             title: { $regex: search, $options: "i" },
//           },
//         }),
//         populate: {
//           path: "createdBy",
//         },
//       })



//     const filteredSavedJobs = allsavedJobs.filter(
//       (savedJob) => savedJob.job !== null
//     );


//     // paginated data
//     const savedJobsWithNullObject = await SavedJob.find({ user: userId })
//       .populate({
//         path: "job",
//         ...(search && {
//           match: {
//             title: { $regex: search, $options: "i" },
//           },
//         }),
//         populate: {
//           path: "createdBy",
//         },
//       })
//       .sort({ createdAt: sort })
//       .skip(skip)
//       .limit(limit);

//     const filteredsavedJobsWithoutNullObject = savedJobsWithNullObject.filter(
//       (savedJob) => savedJob.job !== null
//     );


//     const pipeline = [
//       {
//         $match: {
//           user: new mongoose.Types.ObjectId(userId),
//         },
//       },
//       {
//         $lookup: {
//           from: "jobs",
//           localField: "job",
//           foreignField: "_id",
//           as: "job",
//         },
//       },
//       {
//         $unwind: "$job",
//       },
//     ];

//     if (search) {
//       pipeline.push({
//         $match: {
//           "job.title": {
//             $regex: search,
//             $options: "i",
//           },
//         },
//       });
//     }

//     pipeline.push(
//       {
//         $sort: {
//           createdAt: sort,
//         },
//       },
//       {
//         $skip: skip,
//       },
//       {
//         $limit: limit,
//       }
//     );
    
//     const savedJobs = await SavedJob.aggregate(pipeline);

//     await SavedJob.populate(savedJobs, {
//       path: "job.createdBy",
//     });

    


//     const jobs = filteredsavedJobsWithoutNullObject
//       .filter((item) => item.job)
//       .map((item) => ({
//         ...item.job._doc,
//         isSaved: true,
//       }));


//     return res.status(200).json({
//       currentPage: page,
//       totalPages: Math.ceil(filteredSavedJobs.length / limit),
//       totalSavedJobs: filteredSavedJobs,
//       count: jobs.length,
//       savedJobs,
//       jobs,
//     });

//   } catch (err) {
//     return res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };


export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const requestedPage = parseInt(req.query.page);

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit = 5;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const sort =
      req.query.sort === "Newest First" ? -1 : 1;

    const pipeline = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: "$job",
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          "job.title": {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      });
    }

    // Total count
    const countResult = await SavedJob.aggregate([
      ...pipeline,
      {
        $count: "total",
      },
    ]);

    const totalSavedJobs = countResult[0]?.total || 0;

    // Pagination
    const savedJobs = await SavedJob.aggregate([
      ...pipeline,
      {
        $sort: {
          createdAt: sort,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    // Populate Company information
    await SavedJob.populate(savedJobs, {
      path: "job.createdBy",
    });

    // Prepare jobs for frontend
    const jobs = savedJobs.map((item) => ({
      ...item.job,
      isSaved: true,
    }));

    return res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalSavedJobs / limit),
      totalSavedJobs,
      count: jobs.length,
      savedJobs,
      jobs,
    });

  } catch (err) {
    console.error("Get Saved Jobs Error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
