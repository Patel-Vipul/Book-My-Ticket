import jwt, { type SignOptions } from "jsonwebtoken";
import "dotenv/config"

const ACCESS_TOKEN = process.env.JWT_ACCESS_SECRET_TOKEN
const ACCESS_EXPIRY = process.env.JWT_ACCESS_SECRET_EXPIRY
const REFRESH_TOKEN = process.env.JWT_REFRESH_SECRET_TOKEN
const REFRESH_EXPIRY = process.env.JWT_REFRESH_SECRET_EXPIRY

type AccessTokenPayload = {
    id : string,
    email : string
}

type RefreshTokenPayload = {
    id : string
}

if(!ACCESS_TOKEN || !REFRESH_TOKEN){
    throw new Error("JWT secrets are not defined in env")
}

const generateAccessToken = (payload : AccessTokenPayload): string => {
    //@ts-ignore
    return jwt.sign(payload,ACCESS_TOKEN,{
        expiresIn : (ACCESS_EXPIRY || "15m" )as SignOptions['expiresIn']
    })
}

const verifyAccessToken = (token :string) : AccessTokenPayload => {
    return jwt.verify(token, ACCESS_TOKEN) as AccessTokenPayload
}

const generateRefreshToken = (payload : RefreshTokenPayload) : string => {
    //@ts-ignore
    return jwt.sign(payload, REFRESH_TOKEN, {
        expiresIn : (REFRESH_EXPIRY || "7d") as SignOptions['expiresIn']
    })
}

const verifyRefreshToken = (token : string) : RefreshTokenPayload => {
    return jwt.verify(token, REFRESH_TOKEN) as RefreshTokenPayload
}

export {
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    type AccessTokenPayload,
    type RefreshTokenPayload
}