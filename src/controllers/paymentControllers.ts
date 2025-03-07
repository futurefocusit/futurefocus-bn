import { Request, Response } from "express";
import Payment from "../models/payment";
import Transaction from "../models/Transaction";
import Cashflow from "../models/otherTransactions";
import Student from "../models/Students";
import { sendMessage } from "../utils/sendSms";
import { MessageTemplate } from "../utils/messageBod";

export class PaymentController {
  static SchoolFees = async (req: any, res: Response) => {
    const { id } = req.params;
    const { amount, method, user } = req.body;
    const loggedUser = req.loggedUser

    try {
      const student = await Student.findById(id);
      const payment = await Payment.findOne({ studentId: id });

      if (!student) {
        return res.status(404).json({ message: "Unable to find student info" });
      }
      if (!payment) {
        return res
          .status(404)
          .json({ message: "Unable to find student payment" });
      }

      payment.amountPaid += amount;
      const totalAmountDue = payment.amountDue;

      if (payment.amountPaid < totalAmountDue) {
        payment.status = "partial";
      } else if (payment.amountPaid === totalAmountDue) {
        payment.status = "paid";
      } else {
        payment.status = "overpaid";
      }

      await payment.save();

      await Transaction.create({
        institution:loggedUser.institution,
        studentId: id,
        amount: amount,
        reason: "school fees",
      });

      await Cashflow.create({
        institution:loggedUser.institution,
        amount: amount,
        reason: `${student.name} School Fees`,
        user: user,
        payment: method,
        type: "income",
      });

      const data = {
        student: student.name,
        amount,
        reason: ` School fees`,
        paid: payment.amountPaid,
        remaining: payment.amountDue - payment.amountPaid,
        status: payment.status,
        paymentMethod:method
      };
      await sendMessage(
        MessageTemplate({
          name: student.name,
          amount,
          remain: payment.amountDue - payment.amountPaid,
        }).pay,
        [student.phone.toString()]
      );

      res.status(200).json({
        message: `You have successfully paid school fees of ${amount}`,
        data,
      });
    } catch (error: any) {
      res.status(500).json({ message: `Error: ${error.message} occurred` });
    }
  };

  static payment = async (req: any, res: Response) => {
    try {
    const loggedUser = req.loggedUser

    const payment = await Payment.find({institution:loggedUser.institution});
      res.status(200).json(payment);
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} occured` });
    }
  };
  static getTansactions = async (req: any, res: Response) => {
    try {
    const loggedUser = req.loggedUser

      const transactions = await Transaction.find({institution:loggedUser.institution}).populate("studentId");
      res.status(200).json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: `Eror ${error.message} occured` });
    }
  };
  static addExtra = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount } = req.body;
    try {
      const payment = await Payment.findOne({ studentId: id });
      if (!payment) {
        return res
          .status(400)
          .json({ message: "no payment record for that user" });
      }
      // if (payment.amountDiscounted && payment.amountDiscounted > 0) {
      //   return res
      //     .status(400)
      //     .json({ message: "you can't add extra and dicount at same time" });
      // }
      payment.extraAmount = payment.extraAmount
        ? payment.extraAmount + amount
        : amount;
      payment.amountDue = payment.amountDue + amount;

      await payment.save();
      res.status(200).json({ message: "user payment updated" });
    } catch (error) {
      res.status(500).json({ message: "internal sever error", error });
    }
  };
  static addDiscount = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount } = req.body;
    try {
      const payment = await Payment.findOne({ studentId: id });
      if (!payment) {
        return res
          .status(400)
          .json({ message: "no payment record for that user" });
      }
      // if (payment.extraAmount && payment.extraAmount > 0) {
      //   return res
      //     .status(400)
      //     .json({ message: "you can't add extra and dicount at same time" });
      // }
      payment.amountDiscounted = payment.amountDiscounted
        ? payment.amountDiscounted + amount
        : amount;
      payment.amountDue = payment.amountDue - amount;
      await payment.save();
      res.status(200).json({ message: "user payment updated" });
    } catch (error) {
      res.status(500).json({ message: "internal sever error", error });
    }
  };
  static deleteTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(400).json({ message: "no transaction found" });
      }
      await Transaction.deleteOne({ _id: id });
      return res.status(200).json({ message: "deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "interanl server error" });
    }
  };
  static deletePayment = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const payment = await Payment.findOneAndDelete({ studentId: id });
      if (!payment) {
        return res.status(400).json({ message: "no payment  found" });
      }
      await Student.findByIdAndDelete(id);
      return res.status(200).json({ message: "deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "interanl server error" });
    }
  };
  static AddComment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { comment } = req.body;
    try {
      const payment = await Payment.findOne({studentId:id});
      if (!payment) {
        return res.status(400).json({ message: "no student found" });
      }
      await payment.updateOne({ comment });
      await payment.save();
      return res.status(200).json({ message: "comment  updated" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Internal server error ${error}` });
    }
  };
}
