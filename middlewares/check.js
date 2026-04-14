import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const user = await User.findById(decoded.id);
  req.user = user;
  next();
};
