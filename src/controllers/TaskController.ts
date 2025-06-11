import { Request, Response } from "express";
import { Comment, Reply, Task } from "../models/task";
import { sendMessage } from "../utils/sendSms";
import Team from "../models/Team";
import { TeamTypes } from "../types/Types";

export class taskController {
  static newTask = async (req: any, res: Response) => {
    try {
      const loggedUser = req.loggedUser
      const { user, task, endTime, startTime, manager } = req.body;
      const member = await Team.findById(user)
      if (!member) {
        return res.status(400).json({ message: "user not found" })
      }
      const newTask = new Task({
        user,
        endTime,
        startTime,
        manager,
        task,
        institution: loggedUser.institution
      });
      await newTask.save();
      await sendMessage('a new task is assigned to you. login to xcooll for more details', [member?.phone])
      res.status(200).json({ message: "task created" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  static getTasks = async (req: any, res: Response) => {
    try {
      const loggedUser = req.loggedUser
      const tasks = await Task.find({ institution: loggedUser.institution,deleted:false })
        .populate("user")
        .populate({
          path: "comments",
          populate: [
            {
              path: "user",
            },
            {
              path: "replies",
              populate: {
                path: "user",
              },
            },
          ],
        });
      res.status(200).json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  static getTasksByUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tasks = await Task.find({ user: id,deleted:false })
        .populate("manager")
        .populate({
          path: "comments",
          populate: [
            {
              path: "user",
            },
            {
              path: "replies",
              populate: {
                path: "user",
              },
            },
          ],
        })


      res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static changeStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
      await Task.findByIdAndUpdate(id, { status });
      return res.status(200).json({ message: "status changed " });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  static update = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const { id } = req.params; 
      const member =(await Task.findByIdAndUpdate(id, data).populate('user'))?.user as unknown as TeamTypes;
      if(!member){
        return res.status(400).json({message:"no task updated"})
      }

      await sendMessage('your task is updated. login to xcooll.com for more details', [member.phone])

      return res.status(200).json({ message: "stask updated " });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  static delete = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      await Task.findByIdAndUpdate(id,{deleted:true,deletedBy:req.loggedUser.name});
      // const comments = await Comment.find({ task: id });
      // await Promise.all(
      //   comments.map(async (comment) => {
      //     await Reply.deleteMany({ comment });
      //   })
      // );
      // await Comment.deleteMany({ task: id });
      res.status(200).json({
        message: "deleted Task successfully.",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while deleting the task." });
    }
  };
  static addComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { text, user } = req.body;
      const comment = new Comment({ user, task: id, text });
      const tasks = await Task.findByIdAndUpdate(id, { $push: { comments: comment._id } });
      const member = await Team.findById(tasks?.user);
      if (!member) {
        return res.status(400).json({ message: "user not found" });
      }
      await comment.save();
      await sendMessage('a comment added to your task', [member.phone])
      res.status(200).json({
        message: "added comment successfully.",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while adding comment ." });
      console.log(error);
    }
  };
  static addReply = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { text, user } = req.body;
      const reply = new Reply({ user, comment: id, text });
      await Comment.findByIdAndUpdate(id, { $push: { replies: reply._id } });
      await reply.save();
      res.status(200).json({
        message: "added reply successfully.",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while deleting the task." });
    }
  };
}
