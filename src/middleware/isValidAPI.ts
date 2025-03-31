import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../utils/token";
import Team from "../models/Team";

export const isloggedIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
const api=req.headers.auth


        next();




    } catch (error: any) {
        return res
            .status(500)
            .json({ message: `Erro occurred: ${error.message}` });
    }
};
