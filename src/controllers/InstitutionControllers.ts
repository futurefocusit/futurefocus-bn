import { Request, Response } from "express"
import { Institution } from "../models/institution"
import { Access } from "../models/Access"
import { AccessPayment } from "../models/accessPayment"
import Team from "../models/Team"
import { notifyInstuEmail } from "../utils/emailTemplate"
import { sendEmail } from "../utils/sendEmail"
import { ObjectId } from "mongoose"
import Role from "../models/role"
import Permission from "../models/Permission"
import API from "../models/API"
import generateAPIKey from "../utils/generateAPIKey"
import generateSecret from "../utils/generateSecret"
import mongoose from "mongoose"
import { hashingPassword } from "../utils/PasswordUtils"

export class InstitutionControllers {
    static register = async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { name, email, phone, logo,password } = req.body;

            // Check for existing institution or admin in parallel
            const [inst, adm] = await Promise.all([
                Institution.findOne({ $or: [{ email }, { phone }] }),
                Team.findOne({ email }),
            ]);

            if (inst || adm) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Institution or Admin already exists" });
            }

            // Create institution
            const newInst = await Institution.create([{ name, email, phone, logo: logo.url,slug:name.replace(/\s+/g, "").toLowerCase() }]);
            const institution = newInst[0];

            // Get permissions and create role
            const [permissions] = await Promise.all([
                Permission.find()
            ]);

            const role = await Role.create([{
                institution: institution._id,
                role: "Admin",
                permission: permissions,
                
            }]);

            if (!role[0]) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Admin role not available" });
            }

            // Create admin team member
            await Team.create([{
                institution: institution._id,
                name,
                role: role[0]._id,
                email,
                phone,
                isAdmin: true,
                image: logo.url,
                password: await hashingPassword(password),
                position: "Admin",
            }],);

            // Create API credentials
            await API.create([{
                inst: institution._id,
                api_key: generateAPIKey(),
                api_name: name + " web API",
                secret_key: generateSecret(),
            }]);

            // Send email notification
            const mailOptions = {
                from: process.env.OUR_EMAIL as string,
                to: email,
                subject: "Registered",
                html: notifyInstuEmail(name),
            };

            await sendEmail(mailOptions);
            await session.commitTransaction();

            return res.status(201).json({ message: "Institution created successfully" });
        } catch (error) {
            await session.abortTransaction();
            console.error("Registration error: ", error);
            return res.status(500).json({ message: "Internal server error" });
        } finally {
            session.endSession(); 
        }
    };

    static getCompany = async(req:any, res:Response)=>{
        try {
          const companyData = await Institution.findById(req.loggedUser.institution)  
          res.status(200).json(companyData)
        } catch (error:any) {
          res.status(500).json({message:"failed to get institution data", error: error.message})
        
        }
    }
    static getCompanyByName = async(req:any, res:Response)=>{
        try {
          const companyData = await Institution.findOne({slug:req.params.name})  
          res.status(200).json(companyData)
        } catch (error:any) {
          res.status(500).json({message:"failed to get institution data", error: error.message})
        
        }
    }
    
    static  updateCompany = async(req:any, res:Response)=> {
    try {
      const  id  = req.loggedUser.institution
      const updateData = req.body

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid company ID format",
        })
      }

      // Remove _id from update data if present (prevent ID modification)
      delete updateData._id

      // Check if company exists and is not deleted
      const existingCompany = await Institution.findOne({ _id: id, deleted: false })
      if (!existingCompany) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        })
      }

      // If email is being updated, check for duplicates
      if (updateData.email && updateData.email !== existingCompany.email) {
        const emailExists = await Institution.findOne({
          email: updateData.email,
          deleted: false,
          _id: { $ne: id },
        })

        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: "Company with this email already exists",
          })
        }
      }

      // Update the company
      const updatedCompany = await Institution.findByIdAndUpdate(id, updateData, {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }).select("-__v")

      res.status(200).json({
        success: true,
        message: "Company updated successfully",
        data: updatedCompany,
      })
    } catch (error:any) {
      console.error("Error updating company:", error)

      // Handle validation errors
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err:any) => err.message)
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        })
      }

      res.status(500).json({
        success: false,
        message: "Error updating company",
        error: error.message,
      })
    }
  }

    static all = async (req: Request, res: Response) => {
        try {
            const institutions = await Institution.find({deleted:false});
            const access = await Access.find({deleted:false});

            // Map institutions with their access features
            const institutionsWithAccess = institutions.map(inst => {
                const institutionAccess = access.find(acc => acc.institution.toString() === (inst._id as any).toString());
                return {
                    ...inst.toObject(),
                    access: institutionAccess || {
                        features: [],
                        active: false,
                        duration: null,
                        subscriptionEnd: null
                    }
                };
            });

            res.status(200).json(institutionsWithAccess);
        } catch (error) {
            console.error("Error fetching institutions:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    static verify = async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { id } = req.body;
            const inst = await Institution.findById(id);

            if (!inst) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Institution not found" });
            }

            if (inst.verified) {
                await session.abortTransaction();
                return res.status(200).json({ message: "Institution already verified" });
            }

            // Update institution verification status
            inst.verified = true;
            await inst.save({ session });

            // Calculate trial end date (30 days from now)
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 30);

            // Create initial access record with default features
            const access = await Access.create([{
                institution: inst._id,
                features: [],
                active: true,
                duration: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
                subscriptionEnd: trialEndDate
            }], { session });

            // Send verification email
            const mailOptions = {
                from: process.env.OUR_EMAIL as string,
                to: inst.email,
                subject: "Institution Verified",
                html: notifyInstuEmail(inst.name),
            };

            await sendEmail(mailOptions);
            await session.commitTransaction();

            return res.status(200).json({
                message: "Institution verified successfully",
                accessId: access[0]._id
            });

        } catch (error) {
            await session.abortTransaction();
            console.error("Verification error:", error);
            return res.status(500).json({ message: "Internal server error" });
        } finally {
            session.endSession();
        }
    };
    static activateAllFeatures = async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { amount, months, id } = req.body;

            const [inst, accessInst] = await Promise.all([
                Institution.findById(id),
                Access.findOne({ institution: id,deleted:false })
            ]);

            if (!inst) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Institution not found" });
            }

            if (!accessInst) {
                await session.abortTransaction();
                return res.status(400).json({ message: "No access found! Contact support team" });
            }

            // Create payment record
            await AccessPayment.create([{ institution: inst._id, amount }], { session });

            // Update access features
            const updatedFeatures = accessInst.features.map((feature) => ({
                ...feature,
                active: true,
                lastUpdated: new Date(),
                expiresAt: new Date(feature.expiresAt.getTime() + (months * 2628000000))
            }));
            accessInst.features = updatedFeatures;
            accessInst.set('months', (accessInst.get('months') || 0) + months);
            await accessInst.save({ session });

            await session.commitTransaction();
            return res.status(200).json({ message: "Features activated successfully" });

        } catch (error) {
            await session.abortTransaction();
            console.error("Activation error:", error);
            return res.status(500).json({ message: "Internal server error" });
        } finally {
            session.endSession();
        }
    };
    static activateSomeFeatures = async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { amount, months, id, features } = req.body;

            const [inst, accessInst] = await Promise.all([
                Institution.findById(id),
                Access.findOne({ institution: id })
            ]);

            if (!inst) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Institution not found" });
            }

            if (!accessInst) {
                await session.abortTransaction();
                return res.status(400).json({ message: "No access found! Contact support team" });
            }

            // Create payment record
            await AccessPayment.create([{ institution: inst._id, amount }], { session });

            // Update specific features
            const updatedFeatures = accessInst.features.map((feature) => {
                if (features.includes(feature.feature)) {
                    return {
                        ...feature,
                        active: true,
                        lastUpdated: new Date(),
                        expiresAt: new Date(feature.expiresAt.getTime() + (months * 2628000000))
                    };
                }
                return feature;
            });
            accessInst.features = updatedFeatures;
            await accessInst.save({ session });

            await session.commitTransaction();
            return res.status(200).json({ message: "Features activated successfully" });

        } catch (error) {
            await session.abortTransaction();
            console.error("Activation error:", error);
            return res.status(500).json({ message: "Internal server error" });
        } finally {
            session.endSession();
        }
    };

    static addfeature = async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { features, institution, month } = req.body;

            const access = await Access.findOne({ institution,deleted:false });
            if (!access) {
                await session.abortTransaction();
                return res.status(400).json({ message: "No access found! Contact support team" });
            }

            // Add new features
            const newFeatures = features.map((feature: string) => ({
                feature: feature as unknown as ObjectId,
                active: false,
                expiresAt: new Date(Date.now() + (month * 2628000000))
            }));

            access.features.push(...newFeatures);
            await access.save({ session });

            await session.commitTransaction();
            return res.status(200).json({ message: "Features added successfully" });

        } catch (error) {
            await session.abortTransaction();
            console.error("Add feature error:", error);
            return res.status(500).json({ message: "Internal server error" });
        } finally {
            session.endSession();
        }
    };
}
