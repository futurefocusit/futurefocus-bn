import mongoose, { model, ObjectId, Schema } from "mongoose";

export interface IIntake {
  institution:ObjectId
  intake: string;
  deleted:boolean
}
const IntakeSchema = new Schema<IIntake>(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    intake: { type: String, required: true },
    deleted:{type:Boolean,default:false}

  },
  {
    timestamps: true,
  }
);
const Intake = model<IIntake>("intake", IntakeSchema);

export default Intake;

export interface IShift {
  institution:ObjectId
  days:string
  name:string
  start: String;
  end: String;
  deleted:boolean
}
const ShiftSchema = new Schema<IShift>(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    name: { type: String, required: true },
    days: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
     deleted:{type:Boolean,required:true, default:false}

  },
  {
    timestamps: true,
  }
);
export const Shift = model<IShift>("shift", ShiftSchema);
