import { model, Schema } from "mongoose";
import { InstitutionTypes } from "../types/Types";

const InstitutionSchema = new Schema<InstitutionTypes>({
  location:{type:String},
  coreValues:[{type:String,}],
  heroImage:{type:String},
  address:{type:String},
  languages:[{type:String}],
  gallery:[{url:{type:String},caption:String }],
  mission:{type:String},
  vision:{type:String},
  slug:{type:String},
  days:[{day:{type:String},opening:{type:String},closing:{type:String}}],
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
  phone: [{type:{type: String,}, number:{type:String,}  }],
  logo:{type:String},
  website:{type:String},
  verified:{type:Boolean,required:true, default:false},
  deleted:{type:Boolean,required:true, default:false},
  deletedBy:{type:String}

},{timestamps:true});
export const Institution = model<InstitutionTypes>("Institution",InstitutionSchema)
