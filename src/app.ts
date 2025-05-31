import connection from "./config/db";
import fs from 'fs/promises';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dailyAttendance, teamAttendance } from "./jobs/AttendanceAutomation";
import { indexRouter } from "./routes/indexRoutes";
import http from 'http';
import mongoose from 'mongoose';
import startBackup from "./backup";


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
 
app.get("/", (req, res) => {
  res.send("Welcome to Future Focus");
});

app.use("/api/v1", indexRouter);
// startBackup()

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
