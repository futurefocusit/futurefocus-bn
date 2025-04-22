import { Router } from "express";
import { InstitutionControllers } from "../controllers/InstitutionControllers";
import upload from "../middleware/upload.middleware"; 
import { isloggedIn } from "../middleware/isLoggedIn";

export const InstitutionRouter = Router()
InstitutionRouter.get('/',isloggedIn, InstitutionControllers.all)
InstitutionRouter.post('/' ,
    upload.single('logo'),
     InstitutionControllers.register)
InstitutionRouter.put('/activate-all-features',isloggedIn, InstitutionControllers.activateAllFeatures)
InstitutionRouter.put('/activate-some-features', isloggedIn,InstitutionControllers.activateSomeFeatures)
InstitutionRouter.put('/feature',isloggedIn,InstitutionControllers.addfeature)
InstitutionRouter.put('/verify',isloggedIn,InstitutionControllers.verify)