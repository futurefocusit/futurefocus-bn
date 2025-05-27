import mongoose, { model, Schema } from "mongoose";
import { ServiceTypes } from "../types/Types";

const ServiceSchema= new Schema<ServiceTypes>({
  institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },
  icon: { type: String, required: true },
  subservices:{type:[String], required:true},
  title:{type:String, required:true},
  deleted:{type:Boolean,required:true, default:false}


});
const Service = model<ServiceTypes>("Service", ServiceSchema )
export default Service
