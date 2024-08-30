import { Request, Response } from "express";
import Service from "../models/Service";

export class ServiceController {
  static NewService = async(req:Request, res:Response) => {
    const {title,subservices,icon}= req.body
    try {
      await Service.create({title,subservices,icon})
      res.status(200).json({message:"service Added"})
    } catch (error:any) {
        res.status(500).json({message:`Error ${error.message} Occured`})
        
    }
  };
  static getAll = async(req:Request,res:Response)=>{
    try {
       const services =  await Service.find()
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
  static delete = async(req:Request,res:Response)=>{
    try {
        const serviceId = req.params.id
        await Service.findByIdAndDelete(serviceId)
       res.status(200).json({ message: "service deleted" });

    } catch (error:any) {
       res.status(500).json({ message: `Error ${error.message} occured` });
        
    }
  }
}
