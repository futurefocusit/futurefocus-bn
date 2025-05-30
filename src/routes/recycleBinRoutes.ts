import { Router } from "express";
import { DeletedController } from "../controllers/recycleBinController";
import { isloggedIn } from "../middleware/isLoggedIn";

export const DeletedRoute = Router();

// Route to get all deleted documents from all models
DeletedRoute.get("/all", isloggedIn, DeletedController.getAllDeleted); 
DeletedRoute.delete("/:model/:id", isloggedIn, DeletedController.deletePermenetly); 
DeletedRoute.put("/restore/:model/:id", isloggedIn, DeletedController.restore); 