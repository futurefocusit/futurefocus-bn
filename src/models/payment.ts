import mongoose, { model, Schema } from "mongoose";
import { paymentTypes } from "../types/Types";

const paymentSchema = new Schema<paymentTypes>(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "partial", "overpaid"],
      default: "unpaid",
      required: true,
    },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0, required: true },
    amountDiscounted: { type: Number, default: 0, required: true },
    extraAmount: { type: Number, default: 0, required: true },
    comment: { type: String, required: false },
  deleted:{type:Boolean,required:true, default:false},
   deletedBy:{type:mongoose.Types.ObjectId, ref:"Team"}
  },
  {
    timestamps: true,
  }
);
const Payment = model<paymentTypes>("payment", paymentSchema);
export default Payment;
