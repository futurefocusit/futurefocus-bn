import { Request, Response, Router } from "express";
import cloudinary from "../config/multer";
import uploadSingle from "rod-fileupload";
const UploadRouter=Router()

UploadRouter.post('/file',uploadSingle('file',cloudinary),(req:Request ,res:Response)=>{
    return res.status(200).json({message:'file uploaded',url:req.body.file.url})
})

export default UploadRouter