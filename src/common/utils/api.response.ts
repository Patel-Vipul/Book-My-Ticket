import type { Response } from "express";

class ApiResponse {
  static ok(res: Response, data: unknown = null, message: string = "Success") {
    res.status(200).json({
      success: true,
      status: 200,
      data,
      message,
    });
  }

  static created(
    res: Response,
    data: unknown = null,
    message: string = "Created successfully",
  ) {
    res.status(201).json({
      success: true,
      status: 201,
      data,
      message,
    });
  }

  static noContent(res: Response, message: string = "No content") {
    res.status(204).json({
      success: true,
      status: 204,
      message,
    });
  }
}

export default ApiResponse;
