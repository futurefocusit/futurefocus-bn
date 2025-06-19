import mongoose, { model, Schema } from "mongoose";
import { ServiceTypes } from "../types/Types";

const ServiceSchema= new Schema<ServiceTypes>({
  institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },
  image: { type: String, required: true },
  desc:{type:String, required:true},
  title:{type:String, required:true},
  deleted:{type:Boolean,required:true, default:false},
  deletedBy:{type:String},
  published: {type:Boolean, default:false},
  publishedAt:{type:Schema.Types.ObjectId}
},{timestamps:true});
const Service = model<ServiceTypes>("Service", ServiceSchema )
export default Service
