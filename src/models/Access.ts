import mongoose, { model, Schema, Types } from "mongoose";
import { accesstypes } from "../types/Types";  

const AccessSchema = new Schema<accesstypes>({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true
  },
  subscriptionEnd: {
    type: Date,
    required: true
  },
  features: [{
    feature: {
      type: Types.ObjectId,
      ref: "Feature",
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ["active", "expired", "grace_period"],
    default: "active"
  },
  gracePeriodEnd: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type:Date,
    default: Date.now
  },
  deleted:{type:Boolean,required:true, default:false}
});

// Add middleware to update the updatedAt field
AccessSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Access = model<accesstypes>("Access", AccessSchema);