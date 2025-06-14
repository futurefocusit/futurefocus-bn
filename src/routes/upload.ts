import { Request, Response, Router } from "express";
import cloudinary from "../config/multer";
import uploadSingle, { uploadMultiple } from "rod-fileupload";
const UploadRouter=Router()

UploadRouter.post('/file',uploadSingle('file',cloudinary),(req:Request ,res:Response)=>{
    return res.status(200).json({message:'file uploaded',url:req.body.file.url})
})
UploadRouter.post('/files',uploadMultiple('files',cloudinary),(req:Request ,res:Response)=>{
    //@ts-expect-error error
    return res.status(200).json({message:'file uploaded',urls:req.body.files.map(f=>f.url)})
})

export default UploadRouter