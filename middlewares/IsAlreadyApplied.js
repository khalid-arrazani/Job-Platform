import Job from "../models/Job.js";
import Apply from "../models/Apply.js";



const isAlreadyApplied = async (req, res, next) => {
   const jobId = req.params.jobId.toString();
   console.log(jobId);

    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const alreadyApplied = await Apply.findOne({
      job: jobId , applicant:req.user.id
    });
 console.log(req.user ,job,alreadyApplied );
    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }
    next();
};

export default isAlreadyApplied;