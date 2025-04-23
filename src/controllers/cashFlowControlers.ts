import { Request, Response } from "express";
import Cashflow from "../models/cashFlow";

export class cashflowControler {
  static newData = async (req: any, res: Response) => {
    const loggedUser = req.loggedUser
    const { user, amount, reason, payment, type } = req.body;
    try {
      await Cashflow.create({
        user,
        amount,
        payment,
        reason,
        type,
        institution: loggedUser.institution
      });
      res.status(201).json({ message: `${type} created successfully` });
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} ocuured` })
    }
  };
  static getAll = async (req: any, res: Response) => {
    try {
      const loggedUser = req.loggedUser
      const cashflow = await Cashflow.find({ institution: loggedUser.institution });
      res.status(200).json(cashflow)
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} ocuured` });

    }
  }
  static delete = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
      await Cashflow.findByIdAndDelete(id)
      res.status(200).json({ message: "deleted successfully" })
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} ocuured` });

    }
  }
}
