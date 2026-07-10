import type { Request, Response, NextFunction } from "express";
import ApiError from "../../common/utils/api.error.js";
import { verifyAccessToken } from "../../common/utils/token.jwt.js";
import pool from "../../common/config/database/db.js";


const authenticateUser = async(req: Request, res: Response, next : NextFunction) => {

    let token ;
    if(req.headers.authorization?.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1]
    }

    if(!token){
        throw ApiError.unauthorized("Authentication is required")
    }

    const decoded = verifyAccessToken(token)

    //@ts-ignore
    req.user = {
        user_id : decoded.id,
        user_email : decoded.email,
        user_role : decoded.role
    }

    next()
}

const authorizeAdmin = async(req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const user = req.user

    if(user){
        throw ApiError.unauthorized("Authentication is required!")
    }

    if(user.user_role !== "admin"){
        throw ApiError.forbidden("you are not allowed to perform this operation")
    }

    next()
}

export {
    authenticateUser,
    authorizeAdmin
}