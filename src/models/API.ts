import mongoose, { Mongoose, Schema } from "mongoose";
import { IAPI } from "../types/Types";

const APIschema = new Schema<IAPI>({
    inst:{type:Schema.Types.ObjectId,required:true,ref:"Institution"},
   api_key:{type:String,required:true},
   secret_key:{type:String,required:true},
   api_name:{type:String,required:true},
   deleted:{type:Boolean,required:true, default:false}
  
})

const API = mongoose.model('API',APIschema)
export default API