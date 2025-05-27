import { Request, Response } from "express";
import Payment from "../models/payment";
import Student from "../models/Students";
import Cashflow from "../models/cashFlow";

export const getDashboardSummary = async (req: any, res: Response) => {
  try {
    const loggedUser = req.loggedUser;
    const institution = loggedUser.institution;

    const totalStudents = await Student.countDocuments({ institution,deleted:false });

    const studentStatuses = await Student.aggregate([
      { $match: { institution,deleted:false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const studentStatusCounts = studentStatuses.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const totalPayments = await Payment.countDocuments({ institution,deleted:false });

    const paymentStatuses = await Payment.aggregate([
      { $match: { institution,deleted:false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const paymentStatusCounts = paymentStatuses.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const totalAmountPaid = await Payment.aggregate([
      { $match: { institution,deleted:false } },
      { $group: { _id: null, totalAmount: { $sum: "$amountPaid" } } },
    ]);

    const totalAmountToBePaid = await Payment.aggregate([
      { $match: { institution,deleted:false } },
      { $group: { _id: null, totalAmount: { $sum: "$amountDue" } } },
    ]);

    const shiftStudents = await Student.aggregate([
      { $match: { institution ,deleted:false} },
      {
        $lookup: {
          from: "shifts",
          localField: "selectedShift",
          foreignField: "_id",
          as: "shiftInfo",
        },
      },
      { $unwind: "$shiftInfo" },
      {
        $group: {
          _id: {
            shiftId: "$selectedShift",
            shiftName: "$shiftInfo.name",
          },
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          accepted: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          registered: {
            $sum: { $cond: [{ $eq: ["$status", "registered"] }, 1, 0] },
          },
          started: {
            $sum: { $cond: [{ $eq: ["$status", "started"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          droppedout: {
            $sum: { $cond: [{ $eq: ["$status", "droppedout"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.shiftName": 1 } },
    ]);

    const departmentStudents = await Student.aggregate([
      { $match: { institution ,deleted:false} },
      {
        $lookup: {
          from: "courses",
          localField: "selectedCourse",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      { $unwind: "$courseInfo" },
      {
        $group: {
          _id: {
            courseId: "$selectedCourse",
            courseName: "$courseInfo.title",
          },
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          accepted: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          registered: {
            $sum: { $cond: [{ $eq: ["$status", "registered"] }, 1, 0] },
          },
          started: {
            $sum: { $cond: [{ $eq: ["$status", "started"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          droppedout: {
            $sum: { $cond: [{ $eq: ["$status", "droppedout"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.courseName": 1 } },
    ]);

    const shiftPayments = await Payment.aggregate([
      { $match: { institution,deleted:false } },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "shifts",
          localField: "student.selectedShift",
          foreignField: "_id",
          as: "shiftInfo",
        },
      },
      { $unwind: "$shiftInfo" },
      {
        $group: {
          _id: {
            shiftId: "$student.selectedShift",
            shiftName: "$shiftInfo.title",
          },
          totalPaid: { $sum: "$amountPaid" },
          totalDue: { $sum: "$amountDue" },
        },
      },
      {
        $addFields: {
          totalUnpaid: { $subtract: ["$totalDue", "$totalPaid"] },
        },
      },
      { $sort: { "_id.shiftName": 1 } },
    ]);

    const monthlyCashflows = await Cashflow.aggregate([
      { $match: { institution,deleted:false } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$type", "expenses"] }, "$amount", 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const summary = {
      totalStudents,
      studentStatusCounts,
      totalPayments,
      paymentStatusCounts,
      totalAmountPaid: totalAmountPaid[0]?.totalAmount || 0,
      totalAmountToBePaid: totalAmountToBePaid[0]?.totalAmount || 0,
      shiftStudents,
      departmentStudents,
      shiftPayments,
      monthlyCashflows,
    };

    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
