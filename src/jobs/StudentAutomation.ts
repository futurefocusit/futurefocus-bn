import cron from "node-cron";
import Student from "../models/Students";
const getCurrentMonthYear = () => {
  const date = new Date();
  const monthYear = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  return monthYear;
};
const getEndofIntake = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  const monthYear = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  return monthYear;
};

// const startIntake = () => {
//   cron.schedule("0 0 0 1 * *", async () => {
//     try {
//       const updated = await Student.updateMany(
//         { intake: getCurrentMonthYear(),status:"registered" },
//         { status: "started" }
//       );
//       console.log(updated);
//     } catch (error) {
//       console.log(error);
//     }
//   });
// };
// const endIntake = () => {
//   cron.schedule("0 0 1 * *", async () => {
//     try {
//       const updated = await Student.updateMany(
//         {
//           $and: [
//             {
//               intake: getEndofIntake(),
//               status: "started",
//             },
//           ],
//         },
//         { status: "completed" }
//       );
//       console.log(updated);
//     } catch (error) {
//       console.log(error);
//     }
//   });
// };

// export { startIntake, endIntake };
