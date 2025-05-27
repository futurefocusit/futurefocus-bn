import { Request, Response } from "express";
import mongoose from "mongoose";
import Team from "../models/Team";
import { Institution } from "../models/institution";
import Course from "../models/Course";
import Student from "../models/Students";
import { Material, MaterialRent, Inventory } from "../models/Materials";
import { Media } from "../models/media";
import { AccessTransaction } from "../models/accessTransaction";
import { AccessPayment } from "../models/accessPayment";
import Cashflow from "../models/cashFlow";
import Permission from "../models/Permission";
import Role from "../models/role";
import Service from "../models/Service";
import Video from "../models/youtube";
import Feature from "../models/Feature";
import Intake from "../models/Intake";
import { Shift } from "../models/Intake";
import Payment from "../models/payment";

// Map of model names to their mongoose models
const models = {
    Team,
    Institution,
    Course,
    Student,
    Material,
    MaterialRent,
    Inventory,
    Media,
    AccessTransaction,
    AccessPayment,
    Cashflow,
    Permission,
    Role,
    Service,
    Video,
    Feature,
    Intake,
    Shift,
    Payment
};

export class DeletedController {
    static getAllDeleted = async (req: any, res: Response) => {
        try {
            const loggedUser = req.loggedUser;
            const institutionId = loggedUser?.institution || req.api?.inst;

            // If no institution context, return error
            if (!institutionId) {
                return res.status(400).json({ message: "No institution context found" });
            }

            const results: { [key: string]: any[] } = {};

            // Query each model for deleted documents
            for (const [modelName, model] of Object.entries(models)) {
                try {
                    // Check if model has institution field
                    const schema = (model as any).schema.obj;
                    const hasInstitution = schema.institution !== undefined;

                    // Build query based on whether model has institution field
                    const query = hasInstitution
                        ? { institution: institutionId, deleted: true }
                        : { deleted: true };

                    const deletedDocs = await (model as any).find(query).lean();

                    if (deletedDocs.length > 0) {
                        results[modelName] = deletedDocs;
                    }
                } catch (error) {
                    console.error(`Error fetching deleted documents from ${modelName}:`, error);
                    // Continue with other models even if one fails
                    continue;
                }
            }

            return res.status(200).json({
                message: "Successfully retrieved all deleted documents",
                data: results
            });

        } catch (error: any) {
            return res.status(500).json({
                message: `Error occurred: ${error.message}`
            });
        }
    };
} 