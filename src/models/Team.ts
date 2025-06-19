import mongoose, { model, Schema } from "mongoose";
import { TeamTypes } from "../types/Types";

const TeamSchema = new Schema<TeamTypes>({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
  },
  name: { type: String, required: true },
  active: { type: Boolean, default: true, required: true },
  attend: { type: Boolean, default: true, required: true },
  image: { type: String, required: true },
  position: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  salary: { type: Number },
  dateJoined: { type: String },
  contract: { type: String },
  password: { type: String, require: true, default: "00000000" },
  otp: { type: Schema.Types.Number, require: true, default: null },
  role: { type: Schema.Types.ObjectId, ref: "Role" },
  isAdmin: { type: Schema.Types.Boolean, default: false },
  isSuperAdmin: { type: Schema.Types.Boolean, default: false },
  deleted: { type: Boolean, required: true, default: false },
  deletedBy: { type: String },

  // Added Details
  contractType: { type: String },
  linkedIn: { type: String },
  instagram: { type: String },
  snapchat: { type: String },
  facebook: { type: String },
  nationalId: { type: String },
  leaveDetails: {
    isOnLeave: { type: Boolean, required: true, default: false },
    leaveType: { type: String },
    startDate: { type: String },
    endDate: { type: String },
  },
  bio: { type: String, default: "" },
  skills: { type: [String], default: [] },
  cv: { type: String },
  certificate: {
    types:[{
      name: { type: String },
      url: { type: String },
    }],
    default:[]
  },
  ranking: { type: Number, default: 0 },
  entry: {type: String},
  exit: {type: String},
  paymentDate: {type: Number, },
  currency: {type: String},
  days: {type: String}
});
const Team = model<TeamTypes>("Team", TeamSchema);

const TeamAttendanceSchema = new Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    memberId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    timeOut: { type: Date },
    comment: { type: String },
    response: { type: String },
    status: {
      type: String,
      enum: ["absent", "pending", "present"],
      required: true,
      default: "absent",
    },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
export const TeamAttendandance = model("TeamAttendance", TeamAttendanceSchema);
export default Team;
