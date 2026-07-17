import Job from "../models/Job.js";
import asyncHandler from "express-async-handler";
import { validateJobsDetails } from "../models/Job.js";
import JobSeekerProfile from "../models/JobSeekerProfile.js";
import RecruiterProfile from "../models/RecruiterProfile.js";
import SavedJob from "../models/SavedJob.js";
import { Company } from "../models/Company.js";
import Apply from "../models/Apply.js";




// Get all jobs for job seekers with pagination
export const getAllJobs = asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = 8;


  const jobs = await Job.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("createdBy", "name companyLogo description");

  if (jobs.length === 0) {
    return res.status(404).json({
      message: "No jobs found"
    });
  }

  const total = await Job.countDocuments();



  //  GET saved jobs for this user
  const savedJobs = await SavedJob.find({
    user: req.user.id,
  });


  const savedJobIds = savedJobs.map((s) =>
    s.job.toString()
  );

  // attach isSaved to each job
  const jobsWithSavedState = jobs.map((job) => ({
    ...job._doc,
    isSaved: savedJobIds.includes(job._id.toString()),
  }));


  res.status(200).json({
    success: true,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    jobs: jobsWithSavedState,
  });
});




export const getSavedJobs = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const savedJobs = await SavedJob.find({ user: req.user.id })
    .populate({
      path: "job",
      populate: {
        path: "createdBy",
      },
    });

  // extract only job data (clean response)
  const jobs = savedJobs
    .filter((item) => item.job) // avoid null jobs
    .map((item) => ({
      ...item.job._doc,
      isSaved: true,
    }));

  res.status(200).json(jobs);
});



// Get all recruiter jobs with pagination
export const getMyJobs = asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;

  const limit = 3;

  const recruiterProfile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });

  const company = await Company.findOne({ owner: recruiterProfile.id });


  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  };

  let filter = {
    createdBy: company._id,status: { $ne: "draft" }
  }

  const filterFields = ["status"]

  filterFields.forEach((field) => {
    if (req.query[field] !== undefined &&
      req.query[field].length >= 1 &&
      req.query[field] !== "") {
      filter[field] = req.query[field];
    }
  });

  const search = req.query.search || ""
  const sort = req.query.sort == "Newest First" ? -1 : req.query.sort == "Oldest First" ? 1 : 1



  const jobs = await Job.find(filter)
    .sort({ createdAt: sort })
    .populate("createdBy", "companyLogo name description")
    .skip((page - 1) * limit)
    .limit(limit)
    .where("title").regex(new RegExp(search, "i"))



  const totalJobs = await Job.find(filter)
    .where("title").regex(new RegExp(search, "i"))


  const hasJobs = !!(await Job.exists({ createdBy: company._id }));


  const countActive = await Job.countDocuments({ createdBy: company._id,status:"active" });
  const countClosed = await Job.countDocuments({ createdBy: company._id,status:"closed" });
  const countDraft = await Job.countDocuments({ createdBy: company._id,status:"draft" });

  const JobsWithApply = await Promise.all(
    jobs.map(async (job) => {
      const applicationsCount = await Apply.countDocuments({
        job: job._id,
      });

      return {
        ...job.toObject(),
        applicationsCount,
      };

    })
  );


  res.status(200).json({
    page,
    jobs: JobsWithApply,
    totalPages: Math.ceil(totalJobs.length / limit),
    hasJobs,countActive,countClosed,countDraft
  });

});

// Get single job by id
export const getJobById = asyncHandler(async (req, res) => {
  console.log(req.params.id);
  const jobBy_Id = await Job.findByIdAndUpdate(req.params.id, { $inc: { jobViews: 1 } },
    { returnDocument: "after" })
    .populate("createdBy");

  if (!jobBy_Id) {
    return res.status(404).json({
      message: "No job found",
    });
  }

  let isSaved = false;

  if (req.user) {
    const savedJob = await SavedJob.findOne({
      user: req.user.id,
      job: jobBy_Id._id,
    });

    isSaved = !!savedJob;
  }

  const jobWithSavedState = {
    ...jobBy_Id._doc,
    isSaved,
  };

  const jobById = jobWithSavedState

  return res.status(200).json(jobById);
});

// Create new job for recruiter
export const createJob = asyncHandler(async (req, res) => {
  if(req.body.status !== "draft"){
  const { error } = validateJobsDetails(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }} else if (req.body.status == "draft"){
    if (!req.body.title && req.body.title == "",req.body.title == undefined) {
    return res.status(400).json({
      message:"A job title is required to save a draft."
    });
  }
  };



  const allowedFields = [
    "title",
    "description",
    "location",

    "minSalary",
    "maxSalary",
    "salaryCurrency",
    "salaryPeriod",

    "jobType",
    "workMode",

    "experienceLevel",
    "skills",
    "status"
  ];

  const data = {};

  const profile = await RecruiterProfile.findOne({
    userId: req.user.id
  })

  if (!profile) {
    return res.status(404).json({ message: "Profile not found " })
  }

  const company = await Company.findOne({
    owner: profile.id
  })

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== "") {
      data[field] = req.body[field];
    }
  });

  let message = req.body.status= "active" ? "Create Job seccesfully" : req.body.status= "draft" ? "draft Job seccesfully":null

  const job = await Job.create({
    ...data,
    createdBy: company._id,
  });

  return res.status(201).json({ job: job, message:message});
});


// Update My job for recruiter
export const UpdateJob = asyncHandler(async (req, res) => {

  console.log(req.body);
  console.log(req.params);

  const { error } = validateJobsDetails(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  const allowedFields = [
    "title",
    "description",
    "location",

    "minSalary",
    "maxSalary",
    "salaryCurrency",
    "salaryPeriod",

    "jobType",
    "workMode",

    "experienceLevel",
    "skills",
  ];

   const data = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  });




  const profile = await RecruiterProfile.findOne({
    userId: req.user.id
  })
  if (!profile) {
    return res.status(404).json({ message: "Profile not found " })
  }




  const company = await Company.findOne({
    owner: profile.id
  })
  if (!company) {
    return res.status(404).json({ message: "Company not found " })
  }
 

  const job = await Job.findById(req.params.JobId);
  if (!job) {
    return res.status(404).json({
      message: "Job not found",
    });
  }



  if (!job.createdBy.equals(company._id)) {
    return res.status(403).json({
      message: "You are not allowed to Upadate this job.",
    });
  }

  Object.assign(job, data);
  await job.save();

  return res.status(201).json({ message: "Update Job seccesfully " });
});


// // Update My Draft for recruiter
// export const UpdateDraftJob = asyncHandler(async (req, res) => {


//   const { error } = validateJobsDetails(req.body);

//   if (error) {
//     return res.status(400).json({
//       message: error.details[0].message
//     });
//   }



//   const allowedFields = [
//     "title",
//     "description",
//     "location",

//     "minSalary",
//     "maxSalary",
//     "salaryCurrency",
//     "salaryPeriod",

//     "jobType",
//     "workMode",

//     "experienceLevel",
//     "skills",
//   ];
   
//   const data = {};

//   allowedFields.forEach((field) => {
//     if (req.body[field] !== undefined) {
//       data[field] = req.body[field];
//     }
//   });




//   const profile = await RecruiterProfile.findOne({
//     userId: req.user.id
//   })

//   if (!profile) {
//     return res.status(404).json({ message: "Profile not found " })
//   }


//   const company = await Company.findOne({
//     owner: profile.id
//   })
//   if (!company) {
//     return res.status(404).json({ message: "Company not found " })
//   }
  

//   const job = await Job.findById(req.params.JobId);

//   if (!job) {
//     return res.status(404).json({
//       message: "Job not found",
//     });
//   }


//   if (!job.createdBy.equals(company._id)) {
//     return res.status(403).json({
//       message: "You are not allowed to Upadate this job.",
//     });
//   }

//   Object.assign(job, data);
//   await job.save();

//   return res.status(201).json({ message: "Update Job seccesfully " });
// });



//Delete my jobs 
export const deleteMyJobs = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found",
    });
  }

  const company = await Company.findOne({
    owner: profile._id,
  });

  const { JobId } = req.params;

  if (JobId  == 'undefined') {
  return res.status(400).json({
    message: "Job ID is required.",
  });
}

  const job = await Job.findById(req.params.JobId);

  if (!job) {
    return res.status(404).json({
      message: "Job not found",
    });
  }

  if (!job.createdBy.equals(company._id)) {
    return res.status(403).json({
      message: "You are not allowed to delete this job.",
    });
  }

  await Job.findByIdAndDelete(job._id);

  return res.status(200).json({
    message: "Job deleted successfully.",
  });
});

//togele my jobs  close , active
export const toggleStatus = asyncHandler(async (req, res) => {

  const profile = await RecruiterProfile.findOne({
    userId: req.user.id,
  });

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found",
    });
  }

  const company = await Company.findOne({
    owner: profile._id,
  });

  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }

  const job = await Job.findById(req.params.JobId);

  if (!job) {
    return res.status(404).json({
      message: "Job not found",
    });
  }

  if (!job.createdBy.equals(company._id)) {
    return res.status(403).json({
      message: "You are not allowed to edite this job.",
    });
  }


  job.status = job.status === "active" ? "closed" : "active";
  await job.save()


  return res.status(200).json({
    message: "Job status updated successfully.",
  });
});