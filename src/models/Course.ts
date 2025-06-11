import mongoose, { model, Schema } from "mongoose";
import { CourseTypes } from "../types/Types";
import { timeStamp } from "console";


const CourseSchema = new Schema<CourseTypes>({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  title: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  shifts: { type: [Schema.Types.ObjectId], ref: "shift" },
  scholarship: { type: Number },
  nonScholarship: { type: Number, },
  deleted:{type:Boolean,required:true, default:false},
   deletedBy:{type:String}

},{timestamps:true});
const Course = model<CourseTypes>("Course", CourseSchema)
export default Course