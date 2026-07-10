import Router from "express";
import asyncHandler from "../../common/middleware/asynHandler.js";
import AuthController from "./auth.controller.js";
import { authenticateUser } from "./auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", asyncHandler(AuthController.registerController))

authRouter.post("/login",asyncHandler(AuthController.loginController))
authRouter.post("/refresh-token", asyncHandler(AuthController.refreshTokensController))
authRouter.get("/logout", authenticateUser, asyncHandler(AuthController.logoutController))
export default authRouter 