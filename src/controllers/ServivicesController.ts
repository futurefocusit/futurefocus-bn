import { Request, Response } from "express";
import Service from "../models/Service";
import { Institution } from "../models/institution";

export class ServiceController {
  static NewService = async(req:any, res:Response) => {
    const {title,desc,publishedAt,image,published}= req.body
    try {
      const loggedUser = req.loggedUser
      await Service.create({title,desc,image,published,publishedAt,institution:loggedUser.institution})
      res.status(200).json({message:"service Added"})
    } catch (error:any) {
        res.status(500).json({message:`Error ${error.message} Occured`})
        
    }
  };
  static getAll = async(req:any,res:Response)=>{
    try {
      const loggedUser = req.loggedUser
       const services =req.loggedUser? await Service.find({institution:loggedUser.institution,deleted:false}): await Service.find({institution:req.api.inst})
       res.status(200).json(services)

        
    } catch (error:any) {
       res.status(500).json({ message: `Error ${error.message} occured` });
        
    }

  }
  static getBySlug = async(req:any,res:Response)=>{
    try {
      const {slug}=req.params
      const institution = await Institution.findOne({slug})
      if(!institution){
        res.status(400).json([])
        return 

      }
       const services = await Service.find({institution:institution._id,deleted:false})
       res.status(200).json(services)

        
    } catch (error:any) {
       res.status(500).json({ message: `Error ${error.message} occured` });
        
    }

  }
  static update= async(req:Request, res:Response)=>{
    try {
       const serviceId = req.params.id
       const data = req.body
       const sercive = await Service.findById(serviceId)
       if(!sercive){
        return res.status(400).json({message:"service not found"})
       }
       await Service.findByIdAndUpdate(serviceId,data)
       res.status(200).json({message:"service updated"})
    } catch (error:any) {
       res.status(500).json({ message: `Error ${error.message}` });
        
    }
  }
  static delete = async(req:any,res:Response)=>{
    try {
        const serviceId = req.params.id
        await Service.findByIdAndUpdate(serviceId,{deleted:true,deletedBy:req.loggedUser.name})
       res.status(200).json({ message: "service deleted" });

    } catch (error:any) {
       res.status(500).json({ message: `Error ${error.message} occured` });
        
    }
  }
}
