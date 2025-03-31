import { Router } from "express";
import { StudentControllers } from "../controllers/StudentsController";
import { getAttendance,
     updateAttendance 
    } from "../controllers/Attendance";
import { isVerified } from "../middleware/isVerified";
import { isloggedIn } from "../middleware/isLoggedIn";


export const StudentRoutes =  Router()
StudentRoutes.post('/apply',StudentControllers.apply)
StudentRoutes.post('/past',isloggedIn,StudentControllers.pastRecord)
StudentRoutes.post('/techup/notify',isloggedIn, StudentControllers.notifyTechups)
StudentRoutes.get("/", 
    // isVerified,
    isloggedIn,
    // (req,res,next)=>hasAcces(req,res,next,'student'),
    StudentControllers.students)
StudentRoutes.delete('/:id',isloggedIn,StudentControllers.delete)
StudentRoutes.put('/:id',isloggedIn, StudentControllers.changeStatus)
StudentRoutes.post('/register', isloggedIn,StudentControllers.registerNew)
StudentRoutes.put("/attend/:studentId",isloggedIn, updateAttendance);
StudentRoutes.get("/attendance", isloggedIn,getAttendance);
StudentRoutes.put("/comment/:id",isloggedIn, StudentControllers.AddComment);
StudentRoutes.put("/update/:id",isloggedIn, StudentControllers.Update);


