import { Request, Response } from "express";
import Payment from "../models/payment";
import Transaction from "../models/Transaction";
import Cashflow from "../models/cashFlow";
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
      const payment = await Payment.findOne({ studentId: id,deleted:false });

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
      if (payment.amountPaid > totalAmountDue) {
        return res
          .status(400)
          .json({ message: "amount you are paying are more than required" });
      }
      if (payment.amountPaid < totalAmountDue) {
        payment.status = "partial";
      } else if (payment.amountPaid === totalAmountDue) {
        payment.status = "paid";
      }

      await payment.save();

      await Transaction.create({
        institution: loggedUser.institution,
        studentId: id,
        receiver:loggedUser.name,
        method,
        amount: amount,
        reason: "school fees",
      });

      await Cashflow.create({
        institution: loggedUser.institution,
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
        paymentMethod: method
      };


      res.status(200).json({
        message: `You have successfully paid school fees of ${amount}`,
        data,
      });
      await sendMessage(
        MessageTemplate({
          name: student.name,
          amount,
          remain: payment.amountDue - payment.amountPaid,
        }).pay,
        [student.phone.toString()]
      );
    } catch (error: any) {
      res.status(500).json({ message: `Error: ${error.message} occurred` });
    }
  };

  static recoverPayment = async (req: any, res: Response) => {
    const { studentId } = req.params;
    const { amountDue, amountPaid } = req.body;
    const loggedUser = req.loggedUser

    try {
      const student = await Student.findById(studentId);
      const payment = await Payment.findOne({ studentId });

      if (!student) {
        return res.status(404).json({ message: "Unable to find student info" });
      }
      if (payment) {
        return res
          .status(404)
          .json({ message: "payment already exists " });
      }
      if (amountDue < amountPaid) {
        return res
          .status(400)
          .json({ message: "amount paid is hiher tha required " });
      }

      await Payment.create({
        amountDue,
        amountPaid,
        institution: loggedUser.institution,
        studentId,
        status: amountDue === amountPaid ? 'paid' : 'partial'
      })

      res.status(200).json({
        message: `You have successfully recovered payment`,
      });
    } catch (error: any) {
      res.status(500).json({ message: `Error: ${error.message} occurred` });
    }
  };

  static payment = async (req: any, res: Response) => {
  try {
    const loggedUser = req.loggedUser;

    // Get all payments for the institution
    const payments = await Payment.find({
      institution: loggedUser.institution,
      deleted: false,
    }).populate("studentId");

    // Get all transactions for the institution
    const transactions = await Transaction.find({
      institution: loggedUser.institution,
      deleted: false,
    }).populate("studentId");

    // Map each payment to include related transactions
    const result = payments.map((payment: any) => {
      const relatedTransactions = transactions.filter(
        (tx: any) =>
          tx.studentId &&
          tx.studentId?._id?.toString() === payment.studentId?._id?.toString()
      );

      return {
        ...payment.toObject(),
        transactions: relatedTransactions,
      };
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: `Error ${error.message} occurred` });
  }


  };

  static getTansactions = async (req: any, res: Response) => {
    try {
      const loggedUser = req.loggedUser

      const transactions = await Transaction.find({ institution: loggedUser.institution,deleted:false }).populate("studentId");
      res.status(200).json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: `Erorr ${error.message} occured` });
    }
  };

  static addExtra = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount } = req.body;
    try {
      const payment = await Payment.findOne({ studentId: id,deleted:false });
      if (!payment) {
        return res
          .status(400)
          .json({ message: "no payment record for that user" });
      }

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
      const payment = await Payment.findOne({ studentId: id,deleted:false });
      if (!payment) {
        return res
          .status(400)
          .json({ message: "no payment record for that user" });
      }
      if(payment.amountDue<amount){
        return res
          .status(400)
          .json({ message: "amount due is lower than discount" });
      }

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
  static deleteTransaction = async (req: any, res: Response) => {
    const { id } = req.params;
    try {
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(400).json({ message: "no transaction found" });
      }
      await Transaction.updateOne({ _id: id},{deleted:true,deletedBy:req.loggedUser.name} );
      return res.status(200).json({ message: "deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "interanl server error" });
    }
  };
  static deletePayment = async (req: any, res: Response) => {
    const { id } = req.params;
    try {
      const payment = await Payment.findOneAndUpdate({ studentId: id },{deleted:true,deletedBy:req.loggedUser.name});
      if (!payment) {
        return res.status(400).json({ message: "no payment  found" });
      }
      await Student.findByIdAndUpdate(id,{deleted:true,deletedBy:req.loggedUser.name});
      return res.status(200).json({ message: "deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "interanl server error" });
    }
  };
  static AddComment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { comment } = req.body;
    try {
      const payment = await Payment.findOne({ studentId: id,deleted:false });
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
