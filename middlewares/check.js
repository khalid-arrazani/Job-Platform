import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {

  try {

    // Get access token from cookies
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Access token missing"
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find authenticated user
    const user = await User.findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    // Attach user to request object
    req.user = user;

    next();

  } catch (error) {

    console.error(error);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};
