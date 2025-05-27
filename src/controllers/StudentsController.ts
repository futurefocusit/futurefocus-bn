import { Request, Response } from "express";
import Student from "../models/Students";
import Transaction from "../models/Transaction";
import Payment from "../models/payment";
import Course from "../models/Course";
import Cashflow from "../models/cashFlow";
import { comparePassword } from "../utils/PasswordUtils";
import { sendEmail } from "../utils/sendEmail";
import { generateRandom4Digit } from "../utils/generateRandomNumber";
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
  static delete = async (req: Request, res: Response) => {
    const id = req.params.id;
    const loggedUser = (req as any).loggedUser

    try {
      const student = await Student.findByIdAndUpdate(id,{deleted:true});

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      await Payment.findOneAndUpdate({ studentId: student._id },{deleted:true});
      res.status(200).json({ message: "student deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} occured` });
    }
  };
  static changeStatus = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { status, user, paymentMethod } = req.body;
    const loggedUser = (req as any).loggedUser

    try {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const course = await Course.findById(student.selectedCourse);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      await Student.findByIdAndUpdate(id, { status: status }).populate(
        "selectedCourse"
      );
      if (status === "registered") {
        await Transaction.create({
          institution: loggedUser.institution,
          studentId: student._id,
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
        await sendMessage(
          //@ts-ignore
          MessageTemplate({ name: student.name, amount: 0, remain: 0, course: student.selectedCourse.name }).register,
          [student.phone.toString()]
        );

      }
      // else if (status === 'accepted') {
      //   await sendMessage(
      //     MessageTemplate({
      //       name: student.name,
      //       amount: 0,
      //       remain: 0,
      //       //@ts-expect-error populated course
      //       course: student.selectedCourse.name,
      //     }).admit,
      //     [student.phone.toString()]
      //   );

      // }

      res.status(200).json({ message: `student new status ${status}` });
    } catch (error: any) {
      res.status(500).json({ message: `${error.message} occured` });
    }
  };
  // static pay = async (req: Request, res: Response) => {
  //   const { id } = req.params;
  //   const { amount } = req.body;

  //   try {
  //     const student = await Student.findById(id);
  //     if (!student) {
  //       return res.status(404).json({ message: "student not found" });
  //     }

  //     await Transaction.create({
  //       studentId: student._id,
  //       amount,
  //       reason: "school fees fees",
  //     });
  //   } catch (error: any) {
  //     res.status(500).json({ message: `Error ${error.message} occured` });
  //   }
  // };
  static registerNew = async (req: any, res: Response) => {
    // const session = await mongoose.startSession()
    const student = req.body;
    const loggedUser = req.loggedUser
    // session.startTransaction()

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
      await Payment.create({
        institution: loggedUser.institution,
        studentId: registerStudent._id,
        amountDue: course.nonScholarship,
      });
      await Transaction.create({
        institution: loggedUser.institution,
        studentId: registerStudent._id,
        amount: 10000,
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
      // await session.commitTransaction()
      res.status(201).json({ message: "new student registered" });
      await sendMessage(
        MessageTemplate({
          name: student.name,
        }).register,
        [student.phone]
      );

    } catch (error: any) {
      // await session.abortTransaction()
      res.status(500).json({ message: `Error ${error.message} occured` });
    } finally {
      // session.endSession()
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
 
}
