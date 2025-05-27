import mongoose, {Schema } from "mongoose";
import { attendanceTypes } from "../types/Types";

const AttendanceSchema = new Schema<attendanceTypes>(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    status: {
      type: String,
      enum: ["absent", "present"],
      required: true,
      default: "absent",
    },
 deleted:{type:Boolean,required:true, default:false}

  },

  {
    timestamps: true,
  }
);

export const Attendance = mongoose.model('StudentAttendance',AttendanceSchema)