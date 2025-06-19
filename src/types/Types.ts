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
  deleted: boolean
  deletedBy: string
}
export interface ReplyTypes {
  institution: ObjectId;
  user: ObjectId;
  text: string;
  comment: ObjectId;
  deleted: boolean,
  deletedBy: string
}
export interface CommentTypes {
  institution: ObjectId;
  task: ObjectId;
  text: string;
  user: ObjectId;
  replies: [ObjectId];
  deleted: boolean
}
export interface StudentTypes extends Document {
  institution: ObjectId;
  sticky: string
  admitted: Date
  registered: Date
  name: string;
  email: string;
  phone: string;
  secondPhone: string;
  selectedCourse: ObjectId;
  selectedShift: ObjectId;
  message: string;
  comment: string;
  status: string;
  intake: string;
  image: string
  dob: string,
  location: string,
  gender: string,
  identity: string,
  nationality: string
  deleted: boolean
  deletedBy: string

  nid: string

}
export interface TeamTypes extends Document {
  institution: ObjectId;
  salary: number
  dateJoined: String,
  contract: string
  name: string;
  active: boolean;
  attend: boolean;
  image: string;
  position: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: ObjectId; 
  otp: number | null;
  phone: string;
  deleted: boolean
  deletedBy: string

  // Added Details
  contractType: String,
  linkedIn: string,
  instagram: string,
  snapchat: string,
  facebook: string,
  nationalId: string,
  leaveDetails:{
    isOnLeave: boolean,
    leaveType?: string ,
    startDate?: string,
    endDate?: string,
  },
  bio: string,
  skills: string[],
  cv:string,
  certificate: [{
    name: string,
    url: string
  }],
  ranking: number,
  entry: string,
  exit: string,
  paymentDate: number, 
  currency: string,
  days: string,
}
export interface ServiceTypes extends Document {
  institution: ObjectId;
  title: string;
  subservices: string[];
  icon: string;
  deleted: boolean
  deletedBy: string,
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
  deleted: boolean
  deletedBy: string

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
  deleted: boolean
  deletedBy: string

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
  deleted: boolean
  deletedBy: String
  receiver: string
}

export interface transactionTypes {
  institution: ObjectId;
  studentId: Schema.Types.ObjectId;
  amount: number;
  reason: string;
  deleted: boolean
  deletedBy: string
  receiver: string,
  method: 'momo' | 'bank' | 'cash'
}
export interface cashflowTypes {
  institution: ObjectId;
  type: string;
  user: string;
  amount: number;
  reason: string;
  payment: string;
  deleted: boolean
  deletedBy: string

}
export interface RoleTypes {
  institution: ObjectId;
  role: string;
  permission: ObjectId[];
  deleted: boolean
  deletedBy: string

}
export interface PermissionTypes {
  institution: ObjectId;
  feature: Types.ObjectId;
  permission: string;
  deleted: boolean
  deletedBy: string

}


export interface Blog {
  institution:ObjectId
  _id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string | TeamTypes
  tags: string[]
  image: string
  gallery?: {
    type: "image" | "video"
    url: string
    caption: string
  }[]
  published: boolean
  publishedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface InstitutionTypes {
  institution: ObjectId;
  isSuperInst: boolean
  name: string;
  heroImage:string  
  slug: string;
  mission: string;
  vision: string;
  description: string
  aboutUs: string
  whyChooseUs: string[]
  address:string
  coreValues:string[]
  languages:string[]
  gallery:{url:string, caption:string}[]
  linkedin: string,
  instagram: string,
  tiktok: string,
  facebook: string,
  logo: string;
  email: string;
  phone: { type: string, phone: string }[],
  days:{opening:{type:string},closing:{type:string},day:{type:string}}[]
  verified: boolean;
  website: string
  deleted: boolean
  deletedBy: string
  location: string


}
export interface AccessPaymentTypes {
  institution: ObjectId;
  amount: number;
  duration: number;
  features: {
    feature: ObjectId;
    duration: number;
  }[];
  deletedBy: string
  deleted: boolean,
  status: "pending" | "completed" | "failed";
}
export interface Ifeature {
  feature: Types.ObjectId;
  active: boolean;
  lastUpdated?: Date;
  dueDate: number;
  deletedBy: string
  deleted: boolean
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
  deleted: boolean
  createdAt?: Date;
  updatedAt?: Date;
  deletedBy: string

}
export interface IAPI {
  inst: ObjectId;
  api_name: string;
  api_key: string;
  secret_key: string;
  deleted: boolean
  deletedBy: string

}