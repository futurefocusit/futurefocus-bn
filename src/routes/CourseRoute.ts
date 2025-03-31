import { Router } from "express";
import { CourseController } from "../controllers/CourseController";
import { isloggedIn } from "../middleware/isLoggedIn";

export const CourseRoute = Router();
CourseRoute.post("/new", isloggedIn, CourseController.NewCourse);
CourseRoute.get("/", isloggedIn,CourseController.getAll);
CourseRoute.get("/website", CourseController.getAllByWebsite);
CourseRoute.put("/update/:id",isloggedIn, CourseController.update);
CourseRoute.delete("/delete/:id",isloggedIn, CourseController.delete);
