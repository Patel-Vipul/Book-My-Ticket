import type { Request, Response } from "express";
import { registerDto } from "./auth.dto.js";
import { registerService } from "./auth.service.js";
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
}

export default AuthController;
