import type { Request, Response } from "express";
import { loginDto, registerDto } from "./auth.dto.js";
import { loginService, registerService } from "./auth.service.js";
import ApiError from "../../common/utils/api.error.js";
import ApiResponse from "../../common/utils/api.response.js";

class AuthController {
  static async registerController(req: Request, res: Response) {
    const validatedBody = await registerDto.safeParseAsync(req.body);

    if (!validatedBody.success) {
      throw ApiError.badRequest(
        "Unable to parse request body",
        validatedBody.error.issues.map((issue) => issue.message),
      );
    }

    const registerResult = await registerService(validatedBody.data);

    ApiResponse.created(res, registerResult, "User created Successfully!");
    return;
  }

  static async loginController(req:Request, res: Response){
    const validatedBody = await loginDto.safeParseAsync(req.body);

    if(!validatedBody.success){
      throw ApiError.badRequest(
        "Unable to parse the req body",
        validatedBody.error.issues.map(issue => issue.message)
      )
    }

    const {safeUser, accessToken, refreshToken} = await loginService(validatedBody.data);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge : 7 * 24 * 60 * 60 *1000
    })

    ApiResponse.ok(res,{user : safeUser, accessToken},"Login Successfull!")
    return
    
  }
}

export default AuthController;
