const authorizeRoles = (...roles) => {

  

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {

      console.log(roles);
      return res.status(403).json({
        message: "Not authorized for this action"
      });
    }
    next();
  };
};

export default authorizeRoles;