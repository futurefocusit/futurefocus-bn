import mongoose, { model, Schema } from "mongoose";
import { StudentTypes } from "../types/Types";

const StudentSchema = new Schema<StudentTypes>(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    name: { type: String, required: false },
    email: { type: String, },
    phone: { type: String, required: true },
    secondPhone: { type: String},
    selectedCourse: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    selectedShift: {
      type: Schema.Types.ObjectId,
      ref: "shift",
      required: true,
    },
    intake: { type: String, required: true },
    message: { type: String, required: false },
    comment: { type: String, required: false },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "accepted",
        "registered",
        "started",
        "completed",
        "droppedout",
      ],
      default: "pending",
    },
    deleted: { type: Boolean, required: true, default: false },
     deletedBy:{type:String},
    dob: { type: String },
    admitted: { type: Date },
    sticky:{type:String},
    registered: { type: Date },
    location: { type: String },
    gender: { type: String },
    identity: { type: String },
    image: { type: String },
    nationality: { type: String },
    nid:{type:String}
  },
  {
    timestamps: true,
  }
);

const Student = model<StudentTypes>("Student", StudentSchema);
export default Student;
