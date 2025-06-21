import mongoose, { Schema } from "mongoose";
import { reminderTypes } from "../types/Types";

const notificationSchema= new mongoose.Schema({
    user: {type:Schema.Types.ObjectId, required:true,ref:"Team"},
    notification:{type:String,required:true},
    isRead:{type:Boolean,required:true, default:false}

},{
    timestamps:true
})
export const Notification= mongoose.model('notification',notificationSchema)

const reminderSchema = new Schema<reminderTypes>({
  image: { type: String },
  employeeName: { type: String },
  sentDate: { type: String },
  dueDate: {type: String},
  remainingDays: { type: Number },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Late"],
    default: "Pending",
  },
  isPaid: { type: Boolean, default: false},
  paidAmount:{type:Number},
  remainigAmount:{type: Number},
  paidAt: {type: String}
});

const reminder = mongoose.model('reminderNotification', reminderSchema)

export default reminder
