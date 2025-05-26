import cron from "node-cron";
import Student from "../models/Students";
import { Attendance } from "../models/Attendance";
import Team, { TeamAttendandance } from "../models/Team";

export const dailyAttendance = () => {
  cron.schedule("11 22 * * 1-7", async () => {
    try {
      const today = new Date();
      let dayNumber = today.getDay();
      const students = await Student.find({
        status: "started",
      }).populate('selectedShift');
      for (const student of students) {
        //@ts-expect-error error
       if(student.selectedShift.days.includes(dayNumber+1)){
         await Attendance.create({
           studentId: student._id,
           institution:student.institution
         });
       }
      }
      console.log("Attendance created");
    } catch (error) {
      console.error("Error in dailyAttendance:", error);
    }
  });
};
export const teamAttendance = () => {
  cron.schedule("11 22 * * 1-7", async () => {
    try {
      const members = await Team.find({active:true,attend:true});
      for (const member of members) {
        await TeamAttendandance.create({
          memberId: member._id,
           institution:member.institution

        });
      }
    } catch (error) {
      console.error("Error in dailyAttendance:", error);
    }
  });
};


// export const dropout = () => {
//   cron.schedule("16 9 * * *", async () => {
//     console.log("checking for dropouts");
//     try {
//       const students = await Student.find(
//         { status: "started" }
//       ).populate("selectedShift");

//       for (const student of students) {
//         // Get all attendance records sorted by date
//         const attendanceRecords = await Attendance.find({
//           studentId: student._id,
//           status: { $in: ["absent", "present"] },
//         }).sort({ date: 1 });

//         let consecutiveAbsences = 0;
//         let maxConsecutiveAbsences = 0;

//         // Calculate consecutive absences
//         for (const record of attendanceRecords) {
//           if (record.status === "absent") {
//             consecutiveAbsences++;
//             maxConsecutiveAbsences = Math.max(
//               maxConsecutiveAbsences,
//               consecutiveAbsences
//             );
//           } else {
//             consecutiveAbsences = 0;
//           }
//         }

//         // Check dropout conditions based on shift
//         //@ts-expect-error
//         if (student.selectedShift.days.includes(6)) {
//           if (maxConsecutiveAbsences >= 2) {
//             student.status = "droppedout";
//             await student.save();
//             console.log(
//               `Weekend student ${student._id} dropped out after ${maxConsecutiveAbsences} consecutive absences`
//             );
//           }
//         } else {
//           if (maxConsecutiveAbsences >= 8) {
//             student.status = "droppedout";
//             await student.save();
//             console.log(
//               `Regular student ${student._id} dropped out after ${maxConsecutiveAbsences} consecutive absences`
//             );
//           }
//         }
//       }

//       console.log("Dropout check completed");
//     } catch (error) {
//       console.error("Error in dropout:", error);
//       throw error; // Re-throw to ensure error is properly handled by caller
//     }
//   });
// };
