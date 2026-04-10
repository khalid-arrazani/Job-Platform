import { string } from "joi";
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
title:String,
description:string,
location:string,
createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}
},{timestamps:true})
export default mongoose.model("job", jobSchema);