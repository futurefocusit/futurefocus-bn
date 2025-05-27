import connection from "./config/db";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dailyAttendance, teamAttendance } from "./jobs/AttendanceAutomation";
import { indexRouter } from "./routes/indexRoutes";
// import { backup } from "./jobs/backup";
import { realTimeBackup } from "./config/realtime.backup";
import http from 'http';
import mongoose from 'mongoose';
import Student from "./models/Students";
import { Access } from "./models/Access";
import { AccessPayment } from "./models/accessPayment";
import { AccessTransaction } from "./models/accessTransaction";
import API from "./models/API";
import { Attendance } from "./models/Attendance";
import Cashflow from "./models/cashFlow";
import Course from "./models/Course";
import Feature from "./models/Feature";
import { Institution } from "./models/institution";
import Intake, { Shift } from "./models/Intake";
import { Inventory, Material, MaterialRent } from "./models/Materials";
import { Media } from "./models/media";
import Payment from "./models/payment";
import Permission from "./models/Permission";
import Role from "./models/role";
import Service from "./models/Service";
import { Task } from "./models/task";
import Team from "./models/Team";
import Transaction from "./models/Transaction";
import Video from "./models/youtube";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.CORS_ALLOW
  ? process.env.CORS_ALLOW.split(",")
  : ["https://futurefocus.co.rw", "https://xcool.com"];
 

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", 'x-api-key', 'x-secret-key'],
    credentials: true,
  })
);

app.use(express.json());
dailyAttendance();
teamAttendance();
// realTimeBackup();
 
app.get("/", (req, res) => {
  res.send("Welcome to Future Focus");
});

app.use("/api/v1", indexRouter);

app.listen(PORT, async () => {
  await connection();

  console.log(`App is listening at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

export default app;
