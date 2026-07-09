import type { Request, Response,NextFunction, } from "express";
import ApiError from "../utils/api.error.js";

const errorHandler = async(err, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof ApiError){
        res.status(err.statusCode).json({
            success : false,
            status : err.statusCode,
            message : err.message,
            errors : err.errors
        })
        return
    }

    res.status(500).json({
        success: false,
        status : 500,
        message : "Internal Server Error",
        errors : []
    })
}   

export default errorHandler