import { model, Schema } from "mongoose";

const VideoSchema = new Schema({
  url: { type: String, required: true },
  type: { type: String, required: true,enum:['video','beat'] },
 deleted:{type:Boolean,required:true, default:false}

});
const Video = model("YoutubeVideo", VideoSchema);
export default Video;
