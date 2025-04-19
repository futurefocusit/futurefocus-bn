import { Router } from "express";
import { ServiceController } from "../controllers/ServivicesController";
import { authenticateAPI } from "../middleware/api.auth";
import { isloggedIn } from "../middleware/isLoggedIn";

export const ServiceRoute = Router()
ServiceRoute.post("/new",isloggedIn, ServiceController.NewService)
ServiceRoute.get("/", isloggedIn, ServiceController.getAll)
ServiceRoute.get("/website", authenticateAPI, ServiceController.getAll)
ServiceRoute.put("/update/:id", isloggedIn,ServiceController.update)
ServiceRoute.delete("/delete/:id",isloggedIn, ServiceController.delete)
