import mongoose, { model, Schema, Types } from "mongoose";
import { transactionTypes } from "../types/Types";

const transactionSchema = new Schema<transactionTypes>(
  {
  institution:{type:Types.ObjectId, ref:'Institution'},
    studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    amount: { type: Number, required: true },
    reason: { type: String,  },
    method: { type: String, enum:['cash','bank','momo']},
    receiver:{type:String},
   deleted:{type:Boolean,required:true, default:false},
   deletedBy:{type:String}
  },
  {
    timestamps: true,
  }
);
const Transaction = model<transactionTypes>("Transaction", transactionSchema);
export default Transaction;
