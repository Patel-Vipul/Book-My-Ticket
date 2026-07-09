import Router from "express";
import asyncHandler from "../../common/middleware/asynHandler.js";
import AuthController from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", asyncHandler(AuthController.registerController))


export default authRouter