import  mongoose, { model, Schema } from "mongoose";
import { RoleTypes } from "../types/Types";

const RoleSchema = new Schema<RoleTypes>(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    role: { type: String, required: true },
    permission: {
      type: [Schema.Types.ObjectId],
      default: [],
      required: true,
      ref: "Permission",
    },
 deleted:{type:Boolean,required:true, default:false},
 deletedBy:{type:mongoose.Types.ObjectId, ref:"Team"}
  },
  {
    timestamps: true,
  }
);
const Role = model<RoleTypes>("Role", RoleSchema);
export default Role;
