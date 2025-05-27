import { model, Schema } from "mongoose";

interface IFeature {
  feature: string;
  web:string
  deleted:boolean
}
const FeatureSchema = new Schema<IFeature>(
  {
    feature: {type:String, required:true},
    web: {type:String, required:true, enum:["website","academic-portal"]} ,
   deleted:{type:Boolean,required:true, default:false}

  },
  {
    timestamps: true,
  }
);
const Feature = model<IFeature>("Feature", FeatureSchema);
export default Feature;
