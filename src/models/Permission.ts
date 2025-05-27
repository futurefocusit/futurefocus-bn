import mongoose, { model, Schema } from "mongoose";
import { PermissionTypes } from "../types/Types";


const PermissionSchema = new Schema<PermissionTypes>(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    feature: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Feature",
      default: "",
    },
    permission: { type: String, required: true },
  deleted:{type:Boolean,required:true, default:false}

  },
  {
    timestamps: true,
  }
);
const Permission = model<PermissionTypes>("Permission", PermissionSchema);
export default Permission;
