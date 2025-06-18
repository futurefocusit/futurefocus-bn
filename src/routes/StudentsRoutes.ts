import { Router } from "express";
import { StudentControllers } from "../controllers/StudentsController";
import { getAttendance,
     updateAttendance 
    } from "../controllers/Attendance";
import { isloggedIn } from "../middleware/isLoggedIn";
import { authenticateAPI } from "../middleware/api.auth";
import uploadSingle from "rod-fileupload";
import cloudinary from "../config/multer";


export const StudentRoutes =  Router()
StudentRoutes.post('/apply',uploadSingle('image',cloudinary), authenticateAPI,StudentControllers.apply)
StudentRoutes.post('/past',isloggedIn,StudentControllers.pastRecord)
StudentRoutes.get("/", 
    // isVerified,
    isloggedIn,
    // (req,res,next)=>hasAcces(req,res,next,'student'),
    StudentControllers.students)
StudentRoutes.delete('/:id',isloggedIn,StudentControllers.delete)
StudentRoutes.post('/delete',isloggedIn,StudentControllers.deleteMany)
StudentRoutes.put('/:id',isloggedIn, StudentControllers.changeStatus)
StudentRoutes.put('/sticky/:id',isloggedIn, StudentControllers.addSticky)
StudentRoutes.post('/register', isloggedIn,StudentControllers.registerNew)
StudentRoutes.put("/attend/:studentId",isloggedIn, updateAttendance);
StudentRoutes.get("/attendance", isloggedIn,getAttendance);
StudentRoutes.put("/comment/:id",isloggedIn, StudentControllers.AddComment);
StudentRoutes.put("/update/:id",isloggedIn, StudentControllers.Update);


