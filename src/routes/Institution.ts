import { Router } from "express";
import { InstitutionControllers } from "../controllers/InstitutionControllers";
import { isloggedIn } from "../middleware/isLoggedIn";
import uploadSingle from "rod-fileupload";
import cloudinary from "../config/multer";

export const InstitutionRouter = Router()
InstitutionRouter.get('/',isloggedIn, InstitutionControllers.all)
InstitutionRouter.post('/' ,
    uploadSingle('logo',cloudinary),
     InstitutionControllers.register)
InstitutionRouter.put('/activate-all-features',isloggedIn, InstitutionControllers.activateAllFeatures)
InstitutionRouter.put('/activate-some-features', isloggedIn,InstitutionControllers.activateSomeFeatures)
InstitutionRouter.put('/feature',isloggedIn,InstitutionControllers.addfeature)
InstitutionRouter.put('/verify',isloggedIn,InstitutionControllers.verify)