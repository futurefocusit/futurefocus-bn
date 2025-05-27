import mongoose, { model, Schema } from "mongoose";
import { AccessPaymentTypes } from "../types/Types";

const AccessPaymentSchema = new Schema<AccessPaymentTypes>({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Institution",
  },
  amount: { type: Number, required: true },
   deleted:{type:Boolean,required:true, default:false}

}, { timestamps: true });
export const AccessPayment = model<AccessPaymentTypes>("AccesPayment", AccessPaymentSchema)
