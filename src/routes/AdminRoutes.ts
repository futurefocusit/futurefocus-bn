import { Router } from "express";
import { AdminControllers } from "../controllers/AdminController";
import { getDashboardSummary } from "../controllers/DashboardControllers";
import { PermissionCointroller } from "../controllers/PermissionController";
import { messageController } from "../controllers/sendSms";
import { isloggedIn } from "../middleware/isLoggedIn";
import { isVerified } from "../middleware/isVerified";
import { authenticateAPI } from "../middleware/api.auth";

export const othersRoute = Router()
othersRoute.get('/super', isloggedIn, AdminControllers.superAdmin)
othersRoute.post('/subscribe', AdminControllers.subscribe)
othersRoute.post('/intake',isloggedIn,  AdminControllers.addIntake)
othersRoute.get('/intake', isloggedIn, AdminControllers.getIntakes)
othersRoute.get('/intake/website', AdminControllers.getIntakesByWebsite)
othersRoute.post('/shift', isloggedIn, AdminControllers.addShift)
othersRoute.put('/shift/:id', isloggedIn, AdminControllers.updateShift)
othersRoute.get('/shift', isloggedIn,  AdminControllers.getShifts)
othersRoute.get('/shift/website', authenticateAPI,  AdminControllers.getShifts)
othersRoute.put('/role/:userId',  isloggedIn,PermissionCointroller.assignRole)
othersRoute.delete('/intake/:id',  isloggedIn,AdminControllers.deleteIntake) 
othersRoute.delete('/shift/:id', isloggedIn, AdminControllers.deleteShift) 
othersRoute.get('/dashboard', isloggedIn,isVerified, getDashboardSummary)
othersRoute.post('/sendmessage', isloggedIn, messageController) 