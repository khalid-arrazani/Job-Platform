export const recruiterOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "recruiter") {
    return res.status(403).json({ message: "Only recruiters allowed" });
  }
  next();
};