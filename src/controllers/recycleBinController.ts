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
import { Task } from "../models/task";


const models = {
    Team,
    Institution,
    Course,
    Student,
    Material,
    MaterialRent,
    Inventory,
    Media,
    Task,
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

            if (!institutionId) {
                return res.status(400).json({ message: "No institution context found" });
            }

            const results: { [key: string]: any[] } = {};

            for (const [modelName, model] of Object.entries(models)) {
                try {
                    // Check if model has institution field
                    const schema = (model as any).schema.obj;
                    const hasInstitution = schema.institution !== undefined;

                    // Build query based on whether model has institution field
                    const query = hasInstitution
                        ? { institution: institutionId, deleted: true }
                        : { deleted: true };

                    let deletedDocs;
                    switch (modelName) {
                        case 'Payment':
                            deletedDocs = await (model as any).find(query).populate('studentId').populate('deletedBy').sort({ updatedAt: -1 }).lean();
                            break;
                        case 'Task':
                            deletedDocs = await (model as any).find(query).populate('user manager').populate('deletedBy').sort({ updatedAt: -1 }).lean();
                            break;
                        case 'MaterialRent':
                            deletedDocs = await (model as any).find(query).populate('render receiver').populate('deletedBy').sort({ updatedAt: -1 }).lean();
                            break;
                        case 'Team':
                            deletedDocs = await (model as any).find(query).populate('role').populate('deletedBy').sort({ updatedAt: -1 }).lean();
                            break;
                        case 'Role':
                            deletedDocs = await (model as any).find(query).populate('permission').populate('deletedBy').sort({ updatedAt: -1 }).lean();
                            break;
                        case 'Permission':
                            deletedDocs = await (model as any).find(query).populate('feature').populate('deletedBy').sort({ updatedAt: -1 }).lean();
                            break;
                        default:
                            deletedDocs = await (model as any).find(query).populate('deletedBy').sort({ updatedAt: -1 }).lean();
                    }

                    if (deletedDocs.length > 0) {
                        results[modelName] = deletedDocs;
                    }
                } catch (error) {
                    console.error(`Error fetching deleted documents from ${modelName}:`, error);
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
    static deletePermenetly = async (req: Request, res: Response) => {
        const { model: modelName, id } = req.params;

        const Model = models[modelName as keyof typeof models] as mongoose.Model<any>;

        if (!Model) {
            return res.status(400).json({ message: `Invalid model: ${modelName}` });
        }

        try {
            const deletedItem = await Model.findByIdAndDelete(id);

            if (!deletedItem) {
                return res.status(404).json({ message: `${modelName} with ID ${id} not found.` });
            }

            res.status(200).json({ message: `${modelName} deleted successfully.`, item: deletedItem });
        } catch (error: any) {
            console.error(`Error deleting ${modelName}:`, error);
            res.status(500).json({ message: `Error deleting ${modelName}.`, error: error.message });
        }
    }
    static restore = async (req: Request, res: Response) => {
        const { model: modelName, id } = req.params;

        const Model = models[modelName as keyof typeof models] as mongoose.Model<any>;

        if (!Model) {
            return res.status(400).json({ message: `Invalid model: ${modelName}` });
        }

        try {
            const deletedItem = await Model.findByIdAndUpdate(id,{deleted:false});

            if (!deletedItem) {
                return res.status(404).json({ message: `${modelName} with ID ${id} not found.` });
            }

            res.status(200).json({ message: `${modelName} restored successfully.`, item: deletedItem });
        } catch (error: any) {
            console.error(`Error deleting ${modelName}:`, error);
            res.status(500).json({ message: `Error deleting ${modelName}.`, error: error.message });
        }
    }
} 