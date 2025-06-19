import { Request, Response } from "express";
import Student from "../models/Students";
import Transaction from "../models/Transaction";
import Payment from "../models/payment";
import Course from "../models/Course";
import Cashflow from "../models/cashFlow";
import { sendMessage } from "../utils/sendSms";
import { MessageTemplate } from "../utils/messageBod";
import mongoose, { ObjectId } from "mongoose";
import { StudentTypes } from "../types/Types";

export class StudentControllers {
  static apply = async (req: any, res: Response) => {
    const studentData: StudentTypes
      = req.body;

    try {
      const alreadyExist =
        await Student.findOne({ phone: studentData.phone,deleted:false });
      if (alreadyExist) {
        return res.status(400).json({ message: "You have already applied " });
      }
      studentData.selectedCourse = studentData.selectedCourse as ObjectId
      studentData.selectedShift = studentData.selectedShift as ObjectId
      studentData.institution = req.api.inst
      studentData.image = req.body.image.url

      await Student.create(studentData);
      await sendMessage(
        MessageTemplate({
          name: studentData.name,
        }).apply,
        [studentData.phone.toString()]
      );
      return res.status(200).json({ message: "Your application submitted" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: `failed to apply! try again ${error.message}` });
    }
  };

  static pastRecord = async (req: any, res: Response) => {
    const studentData = req.body;
    const loggedUser = req.loggedUser
    try {
      const alreadyExist =
        await Student.findOne({ phone: studentData.phone, institution: loggedUser.institution });
      if (alreadyExist) {
        return res.status(400).json({ message: "already recorded " });
      }
      studentData.selectedCourse = studentData.selectedCourse as ObjectId
      studentData.selectedShift = studentData.selectedShift as ObjectId

      studentData.institution = loggedUser.institution
      await Student.create(studentData);
      return res.status(200).json({ message: "record inserted " });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: `failed to insert! try again ${error.message}` });
    }
  };



  static students = async (req: any, res: Response) => {
    try {
      const loggedUser = req.loggedUser

      const students = await Student.find({ institution: loggedUser.institution,deleted:false})
        .sort({ createdAt: -1 })
        .populate("selectedCourse selectedShift");
      return res.status(200).json(students);
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} occurred` });
    }
  };
  static delete = async (req: any, res: Response) => {
    const id = req.params.id;
    const loggedUser = (req as any).loggedUser

    try {
      const student = await Student.findByIdAndUpdate(id,{deleted:true,deletedBy:req.loggedUser.name});

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      await Payment.findOneAndUpdate({ studentId: student._id },{deleted:true,deletedBy:req.loggedUser.name});
      res.status(200).json({ message: "student deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} occured` });
    }
  };
  static deleteMany = async (req: any, res: Response) => {
  const loggedUser = (req as any).loggedUser;
  const { ids } = req.body; // Extract array of IDs from request body

  try {
    // Validate that ids array is provided and not empty
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Please provide an array of student IDs" });
    }

    // Update multiple students to mark them as deleted
    const updateResult = await Student.updateMany(
      { _id: { $in: ids }, deleted: { $ne: true } }, // Only update non-deleted students
      { 
        deleted: true, 
        deletedBy: loggedUser.name,
        deletedAt: new Date() // Optional: add timestamp
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "No students found with the provided IDs" });
    }


    await Payment.updateMany(
      { studentId: { $in: ids }, deleted: { $ne: true } },
      { 
        deleted: true, 
        deletedBy: loggedUser.name,
        deletedAt: new Date() 
      }
    );

    res.status(200).json({ 
      message: `${updateResult.modifiedCount} student(s) deleted successfully`,
      deletedCount: updateResult.modifiedCount
    });

  } catch (error: any) {
    console.error('Delete many students error:', error);
    res.status(500).json({ message: `Error ${error.message} occurred` });
  }
};

static changeStatus = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { status, user, paymentMethod } = req.body;
  const loggedUser = (req as any).loggedUser;


  try {
    const student = await Student.findById(id)
    if (!student) {
  
      return res.status(404).json({ message: "Student not found" });
    }

    const course = await Course.findById(student.selectedCourse)
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (status === "registered") {
      student.registered = new Date();

      await Transaction.create({
        institution: loggedUser.institution,
        studentId: student._id,
        method:paymentMethod,
        receiver:loggedUser.name,
        amount: 10000,
        reason: "Registration fees",
      });

      await Cashflow.create({
        institution: loggedUser.institution,
        user: user,
        amount: 10000,
        reason: `${student.name} registration Fees`,
        payment: paymentMethod,
        type: "income",
      });

      await Payment.create({
        institution: loggedUser.institution,
        studentId: student._id,
        amountDue: course.scholarship,
        amountDiscounted: course.nonScholarship - course.scholarship,
      });
    } else if (status === 'accepted') { 
      student.admitted = new Date();
    }

    student.status = status;
    await student.save();

  


    res.status(200).json({ message: `student new status ${status}` });

  } catch (error: any) {
   
    res.status(500).json({ message: `${error.message} occurred` });
  }
};

 
  static registerNew = async (req: any, res: Response) => {
    const session = await mongoose.startSession()
    const student = req.body;
    const loggedUser = req.loggedUser
    session.startTransaction()

    try {
      const course = await Course.findById(student.selectedCourse);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const alreadyExist = await Student.findOne({ phone: student.phone, institution: loggedUser.institution });
      if (alreadyExist) {
        return res.status(400).json({ message: "You have already registered" });
      }
      student.selectedCourse = student.selectedCourse as ObjectId
      student.selectedShift = student.selectedShift as ObjectId
      student.institution = loggedUser.institution
      const registerStudent = new Student(student);
      registerStudent.status = "registered";
      registerStudent.registered = new Date()
      await Payment.create({
        institution: loggedUser.institution,
        studentId: registerStudent._id,
        amountDue: course.nonScholarship,
      });
      await Transaction.create({
        institution: loggedUser.institution,
        studentId: registerStudent._id,
        amount: 10000,
        receiver:loggedUser.name,
        method: student.payment,
        reason: "Registration fees",
      });
      await Cashflow.create({
        institution: loggedUser.institution,
        amount: 10000,
        reason: `${student.name} registration Fees`,
        user: student.user,
        payment: student.payment,
        type: "income",
      });
      await registerStudent.save();
      await session.commitTransaction()
      res.status(201).json({ message: "new student registered" });
      await sendMessage(
        MessageTemplate({
          name: student.name,
        }).register,
        [student.phone]
      );

    } catch (error: any) {
      await session.abortTransaction()
      res.status(500).json({ message: `Error ${error.message} occured` });
    } finally {
      session.endSession()
    }
  };
  static Update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    try {
      const student = await Student.findByIdAndUpdate(id, data);
      if (!student) {
        return res.status(400).json({ message: "no student found" });
      }
      return res.status(200).json({ message: "student updated" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `internal server error ${error}` });
    }
  };
  static AddComment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { comment } = req.body;
    try {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(400).json({ message: "no student found" });
      }
      await student.updateOne(
        { comment },
        {
          timestamps: false,
        }
      );
      await student.save();
      return res.status(200).json({ message: "student updated" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Internal server error ${error}` });
    }
  };
  static addSticky =  async(req:Request, res:Response)=>{
    try {
    const {id} = req.params
    const {sticky} = req.body
    await Student.findByIdAndUpdate(id,{sticky})
    res.status(200).json({message:"sticky added"})
    } catch (error:any) {
    res.status(500).json({message:"sticky not added",error:error.message})
      
    }
  }
 
}
