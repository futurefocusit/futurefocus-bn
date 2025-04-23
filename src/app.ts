import connection from "./config/db";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dailyAttendance, teamAttendance } from "./jobs/AttendanceAutomation";
import { indexRouter } from "./routes/indexRoutes";
import { backup } from "./jobs/backup";
import { realTimeBackup } from "./config/realtime.backup";

dotenv.config();

const PORT = process.env.PORT || 5000; 
const app = express();
const allowedOrigins = process.env.CORS_ALLOW   
  ? process.env.CORS_ALLOW.split(",")
  : ["https://futurefocus.co.rw","https://xcool.com"]; 

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
backup()

app.get("/", (req, res) => {
  res.send("Welcome to Future Focus");
});
app.use("/api/v1", indexRouter);

app.listen(PORT, async() => {
await connection();
await  realTimeBackup();
  console.log(`App is listening at http://localhost:${PORT}`);
 
});

export default app;
