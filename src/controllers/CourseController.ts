import { Request, Response } from "express";
import Course from "../models/Course";
import { Institution } from "../models/institution";


export class CourseController {
  static NewCourse = async (req: any, res: Response) => {
    const { title, image,rating,scholarship,nonScholarship,shifts,active } = req.body;
    const loggedUser = req.loggedUser

    try {
      await Course.create({ title, rating, image,institution:loggedUser.institution,scholarship,nonScholarship,shifts,active });
      res.status(200).json({ message: "course Added" });
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} Occured` });
    }
  };
  static getAll = async (req: any, res: Response) => {
    try {
    const loggedUser = req.loggedUser
      const courses =req.loggedUser? await Course.find({institution:loggedUser.institution,deleted:false}).populate('shifts'): await Course.find({institution:req.api.inst,deleted:false}).populate('shifts');
      res.status(200).json(courses);
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} occured` });
    }
  };
  
  static update = async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const data = req.body;
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({ message: "course not found" });
      }
      await Course.findByIdAndUpdate(courseId, data);
      res.status(200).json({ message: "course updated" });
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message}` });
    }
  };
  static delete = async (req: any, res: Response) => {
    try {
      const courseId = req.params.id;
    await Course.findByIdAndUpdate(courseId,{deleted:true,deletedBy:req.loggedUser.name});
      res.status(200).json({ message: "course deleted" });
    } catch (error: any) {
      res.status(500).json({ message: `Error ${error.message} occured` });
    }
  };
  static addShift = async(req:Request,res:Response)=>{
    const {id} = req.params
    const  {shift} = req.body
    try {
      const course =await Course.findById(id)
      if(!course){
        return res.status(400).json({message:"course not found"})
      }
      if(course.shifts.includes(shift)){
       return  res.json(400).json({message:"shift available"})
      }
      course.shifts.push(shift)
      await course.save()
      res.json(200).json({message:"shift added"})
    } catch (error:any) {
      res.status(500).json({message:`Error ${error.message} occured`})
    }

  }
 
   
}