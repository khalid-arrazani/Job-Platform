import mongoose from "mongoose";
import Joi from "joi";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
  type: String,
  enum: ["jobSeeker", "recruiter"],
  default: "jobSeeker"
},
    resetCode: String,

    resetCodeExpire: Date,
  },
  { timestamps: true },
);
userSchema.methods.generateToken = function( ){
  return jwt.sign({id: this._id, isAdmin: this.isAdmin},process.env.JWT_SECRET_KEY,{ expiresIn: "7d" })
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

export const validateUserRegistration = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(124).required(),
  });
  return schema.validate(user);
};

export default mongoose.model("User", userSchema);
