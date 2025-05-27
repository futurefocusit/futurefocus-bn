import { Router } from "express";
import { DeletedController } from "../controllers/DeletedController";
import { isloggedIn } from "../middleware/isLoggedIn";

export const DeletedRoute = Router();

// Route to get all deleted documents from all models
DeletedRoute.get("/all", isloggedIn, DeletedController.getAllDeleted); 