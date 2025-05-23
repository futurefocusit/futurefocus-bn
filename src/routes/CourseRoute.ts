import { Router } from "express";
import { CourseController } from "../controllers/CourseController"; 
import { isloggedIn } from "../middleware/isLoggedIn";
import { authenticateAPI } from "../middleware/api.auth";

export const CourseRoute = Router();
CourseRoute.post("/new", isloggedIn, CourseController.NewCourse);
CourseRoute.get("/", isloggedIn,CourseController.getAll);
CourseRoute.get("/website", authenticateAPI,CourseController.getAll);
CourseRoute.put("/update/:id",isloggedIn, CourseController.update);
CourseRoute.delete("/delete/:id",isloggedIn, CourseController.delete);
