import { Router } from "express";
import { TeamControllers } from "../controllers/TeamControllers";
import { checkLocation } from "../middleware/checkLocation";
import { isloggedIn } from "../middleware/isLoggedIn";
export interface Location {
  latitude: number;
  longitude: number;
}
const allowedLocation: Location = {
  latitude: -1.9507,
  longitude: 30.0663,
};
export const TeamRoute = Router()
TeamRoute.post("/two-factor/:id", TeamControllers.verifyOTP);
TeamRoute.get("/two-factor/:id", TeamControllers.resendOTP);
TeamRoute.post("/new", isloggedIn, TeamControllers.AddMember)
TeamRoute.get("/", isloggedIn, TeamControllers.Team)
TeamRoute.get("/admins", isloggedIn, TeamControllers.teamAdmins)
TeamRoute.delete("/delete/:id", isloggedIn, TeamControllers.deleteMember)
TeamRoute.put("/update/:id", isloggedIn, TeamControllers.update)
TeamRoute.put(
  "/request-attend/:id", isloggedIn,
  checkLocation(allowedLocation, 1000),
  TeamControllers.requestAttend
);
TeamRoute.put(
  "/approve-attend/:id",
  checkLocation(allowedLocation, 1000), isloggedIn,
  TeamControllers.approveAttend
);
TeamRoute.get("/attendance", isloggedIn, TeamControllers.attendance)
TeamRoute.get("/my-attendance/:id", isloggedIn, TeamControllers.myAttendance)
TeamRoute.post("/forgot-password", TeamControllers.forgotPassword);
TeamRoute.post("/login", TeamControllers.login);
TeamRoute.put("/reset-password/:token", TeamControllers.resetPassword);
TeamRoute.get("/logged-user", isloggedIn, TeamControllers.getUser);
TeamRoute.put("/toogle-admin/:id", TeamControllers.toggleAdmin);
TeamRoute.put("/leave/:id", checkLocation(allowedLocation, 1000), TeamControllers.leave);
TeamRoute.put("/comment/:id", TeamControllers.addComment);
TeamRoute.put("/response/:id", TeamControllers.addresponse);
TeamRoute.put("/toogle-attendance/:id", TeamControllers.switchAttend);
TeamRoute.put("/toogle-active/:id", TeamControllers.activateMember);
TeamRoute.get("/deleted", isloggedIn, TeamControllers.getDeletedMembers);
TeamRoute.put("/update-rankings", TeamControllers.updateRanking)
