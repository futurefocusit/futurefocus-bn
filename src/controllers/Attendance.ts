import { Request, Response } from "express";
import { Attendance } from "../models/Attendance";
import Student from "../models/Students";
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId} = req.params;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); 

    const student = await Student.findById(studentId).populate('selectedShift');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (student.status!=='started') {
      return res.status(404).json({ message: "Student not started yet" });
    }
            //@ts-expect-error populated object
    if (currentTime < student.selectedShift.start || currentTime > student.selectedShift.end) {
      return res.status(400).json({
        message: "You can only attend on your shift",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      studentId: studentId,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).exec();
    if (attendance) {
     
      attendance.status = "present";
    } else {
      attendance = new Attendance({
        studentId: studentId,
        status: 'present',
      });
      // return res.status(400).json({message:"attendance today not available"})
    }

    await attendance.save();

    res
      .status(200)
      .json({ message: "Attending successfully", attendance });
      //@ts-ignore
      console.log(student.selectedShift.start)
      console.log(currentTime)
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAttendance = async (req:any,res:Response)=>{
  try {
    const loggedUser = req.loggedUser
    const attendance = await Attendance.find({ institution: loggedUser.institution })
  .populate({
    path: "studentId",
    populate: {
      path: "selectedShift" // Assuming selectedShift is a ref inside the Student model
    }
  });
    res.status(200).json(attendance)
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    
  }

}