import express from "express";
import {
  uploadMedia,
  updateMedia,
  deleteMedia,
  getMedia,
  getVideos,
  postVideos,
  deleteVideos,
} from "../controllers/mediaControllers";
import uploadSingle from "rod-fileupload";
import cloudinary from "../config/multer";
 

const MediRouters = express.Router();

MediRouters.post("/", uploadSingle('file',cloudinary), uploadMedia);
MediRouters.put("/:id", uploadSingle('file',cloudinary), updateMedia);
MediRouters.delete("/:id", deleteMedia);
MediRouters.get("/", getMedia);
MediRouters.get("/youtube", getVideos);
MediRouters.delete("/youtube/:id", deleteVideos);
MediRouters.post("/youtube", postVideos);

export default MediRouters;
 