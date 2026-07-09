class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: string[];
  public isOperational: boolean;

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(
    message: string = "Bad Request!",
    errors: string[] = [],
  ): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = "Unauthorized Request!"): ApiError {
    return new ApiError(401, message);
  }

  static notFound(message: string = "Not Found!"): ApiError {
    return new ApiError(409, message);
  }

  static conflict(message: string = "Conflict!"): ApiError {
    return new ApiError(409, message);
  }

  static forbidden(message: string = "forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static internal(message: string = "Internal server error!"): ApiError {
    return new ApiError(500, message);
  }
}

export default ApiError;
