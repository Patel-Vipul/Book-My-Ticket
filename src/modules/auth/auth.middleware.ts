import type { Request, Response, NextFunction } from "express";
import ApiError from "../../common/utils/api.error.js";
import { verifyAccessToken } from "../../common/utils/token.jwt.js";


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
        user_email : decoded.email
    }

    next()
}

export {
    authenticateUser
}