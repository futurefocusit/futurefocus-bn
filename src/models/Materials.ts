import mongoose, { model, ObjectId, Schema } from "mongoose";

interface IMaterial {
  institution: ObjectId;
  materialName: string;
  category: ObjectId;
  amount: number;
  SN: string;
  type: string;
  rent: number;
  deleted:boolean
}
export interface IMaterialRent {
  _id?:ObjectId,
  institution:ObjectId
  materialId: ObjectId;
  render: ObjectId;
  receiver: ObjectId;
  rendeeName: String; 
  returnDate: Date;
  returnedDate: Date;
  returned:boolean
  amount: number;
  cost: number;
  deleted:boolean
  
}
interface IInventory {
  name: String;
  institution: 
     mongoose.Schema.Types.ObjectId,
     deleted:boolean
   
}


const InventorySchema = new Schema<IInventory>({
  name: { type: String, required: true },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  deleted:{type:Boolean,default:false}

});


export const Inventory = model<IInventory>("Inventory", InventorySchema);


const MaterialSchema = new Schema<IMaterial>(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    materialName: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Inventory" },
    amount: { type: Number, required: true, default: 0 },
    SN: { type: String },
    type: { type: String },
    rent: { type: Number, required: true, default: 0 },
  deleted:{type:Boolean,default:false}

  },
  {
    timestamps: true,
  }
);
export const Material = model<IMaterial>("Material", MaterialSchema);

const MaterialRentSchema = new Schema<IMaterialRent>({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  materialId: { type: Schema.Types.ObjectId, required: true, ref: "Material" },
  render: { type: Schema.Types.ObjectId, ref: "Team",required:true },
  receiver: { type: Schema.Types.ObjectId, ref: "Team" },
  rendeeName: { type: String, required: true },
  returnDate: { type: Date, required: true },
  returnedDate: { type: Date },
  returned: { type: Boolean, default: false },
  cost: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 },
  deleted:{type:Boolean,required:true, default:false}

},{
  timestamps:true
});
export const MaterialRent = model<IMaterialRent>("MaterialRent", MaterialRentSchema);
