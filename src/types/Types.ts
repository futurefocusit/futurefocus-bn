import mongoose, { Document, ObjectId, Schema, Types } from "mongoose";
export interface TaskTypes extends Document {
  institution: ObjectId;
  user: ObjectId;
  task: string;
  endTime: Date;
  startTime: Date;
  description: string;
  status: string;
  manager: ObjectId;
  comments: [ObjectId];
  deleted:boolean
}
export interface ReplyTypes {
  institution: ObjectId;
  user: ObjectId;
  text: string;
  comment: ObjectId;
  deleted:boolean
}
export interface CommentTypes {
  institution: ObjectId;
  task: ObjectId;
  text: string;
  user: ObjectId;
  replies: [ObjectId];
  deleted:boolean
}
export interface StudentTypes extends Document {
  institution: ObjectId;
  name: string;
  email: string;
  phone: Number;
  selectedCourse: ObjectId;
  selectedShift: ObjectId;
  message: string;
  comment: string;
  status: string;
  intake: string;
  dob:string,
  location:string,
  gender:string,
  identity:string,
  nationality:string
  deleted:boolean
  
}
export interface TeamTypes extends Document {
  institution: ObjectId;
  name: string;
  active: boolean;
  attend: boolean;
  image: string;
  position: string;
  email: string;
  instagram: string;
  password: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: ObjectId;
  otp: number | null;
  phone: string;
  deleted:boolean
}
export interface ServiceTypes extends Document {
  institution: ObjectId;
  title: string;
  subservices: string[];
  icon: string;
  deleted:boolean
}

export interface CourseTypes extends Document {
  institution: ObjectId,
  title: string;
  description: string;
  rating: number;
  image: string;
  scholarship: number;
  active: boolean;
  nonScholarship: number;
  shifts: ObjectId[];
  deleted:boolean
}
export interface socialMedias {
  web: string,
  link: string

}
export interface Contact extends Document {
  location: [string];
  socialMedias: [socialMedias];
  contact: [number];
  emails: [string];


}

export interface attendanceTypes {
  institution: ObjectId;
  studentId: Schema.Types.ObjectId;
  status: string;
  deleted:boolean
}
export interface paymentTypes {
  institution: ObjectId;
  studentId: Schema.Types.ObjectId;
  status: string;
  amountDue: number;
  amountPaid: number;
  amountDiscounted: number;
  extraAmount: number;
  comment: string;
  deleted:boolean
}

export interface transactionTypes {
  institution: ObjectId;
  studentId: Schema.Types.ObjectId;
  amount: number;
  reason: string;
  deleted:boolean
}
export interface cashflowTypes {
  institution: ObjectId;
  type: string;
  user: string;
  amount: number;
  reason: string;
  payment: string;
  deleted:boolean
}
export interface RoleTypes {
  institution: ObjectId;
  role: string;
  permission: ObjectId[];
  deleted:boolean
}
export interface PermissionTypes {
  institution: ObjectId;
  feature: Types.ObjectId;
  permission: string;
  deleted:boolean
}
export interface InstitutionTypes {
  institution: ObjectId;
  isSuperInst: boolean
  name: string;
  logo: string;
  email: string;
  phone: number;
  verified: boolean;
  website: string
  deleted:boolean
}
export interface AccessPaymentTypes {
  institution: ObjectId;
  amount: number;
  duration: number;
  features: {
    feature: ObjectId;
    duration: number;
  }[];
  deleted:boolean,
  status: "pending" | "completed" | "failed";
}
export interface Ifeature {
  feature: Types.ObjectId;
  active: boolean;
  lastUpdated?: Date;
  dueDate: number;
  deleted:boolean
}
export interface accesstypes {
  institution: ObjectId;
  subscriptionEnd: Date;
  features: {
    feature: ObjectId;
    active: boolean;
    lastUpdated?: Date;
    expiresAt: Date;
  }[];
  status: "active" | "expired" | "grace_period";
  gracePeriodEnd?: Date;
  deleted:boolean
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IAPI {
  inst: ObjectId;
  api_name: string;
  api_key: string;
  secret_key: string;
  deleted:boolean

}