import { model, Schema } from "mongoose";
import { InstitutionTypes } from "../types/Types";


const InstitutionSchema = new Schema<InstitutionTypes>({
  location:{type:String},
  coreValues:[{type:String,}],
  heroImage:{type:String},
  address:{type:String},
  languages:[{type:String}],
  gallery:[{type:String}],
  mission:{type:String},
  vision:{type:String},
  slug:{type:String},
  opening:{type:String,required:true},
  closing:{type:String,required:true},
  whyChooseUs:{type:[String], default:[]},
  linkedin:{type:String},
  instagram:{type:String},
  tiktok:{type:String},
  facebook:{type:String},
  description:{type:String},
  aboutUs:{type:String},
  name: { type: String, required: true },
  isSuperInst:{type:Boolean,required:true,default:false},
  email: { type: String, required: true },
  phone: [{ type: String, required: true }],
  logo:{type:String},
  website:{type:String},
  verified:{type:Boolean,required:true, default:false},
  deleted:{type:Boolean,required:true, default:false},
   deletedBy:{type:String}

},{timestamps:true});
export const Institution = model<InstitutionTypes>("Institution",InstitutionSchema)
