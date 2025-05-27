import { Router } from "express";
import { PermissionCointroller } from "../controllers/PermissionController";
import { isloggedIn } from "../middleware/isLoggedIn";

export const RoleRouter= Router()
RoleRouter.post('/',isloggedIn, PermissionCointroller.AddRole)
RoleRouter.put('/:roleId',isloggedIn, PermissionCointroller.assignPermisson)
RoleRouter.delete('/',isloggedIn, PermissionCointroller.deleteRole)
RoleRouter.get('/',isloggedIn,PermissionCointroller.viewRole)
RoleRouter.post('/permission',isloggedIn,PermissionCointroller.AddPermission)
RoleRouter.get('/permission',isloggedIn,PermissionCointroller.ViewPermission)
RoleRouter.post('/feature',isloggedIn,PermissionCointroller.AddFeature)
RoleRouter.get('/feature',PermissionCointroller.ViewFeature)