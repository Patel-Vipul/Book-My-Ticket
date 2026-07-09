import pool from "../../common/config/database/db.js";
import ApiError from "../../common/utils/api.error.js";
import { hashToken, verifyToken } from "../../common/utils/hashToken.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../common/utils/token.jwt.js";

const registerService = async (payload) => {
  const { firstName, lastName, email, password, role } = payload;

  const searchEmailQuery = `SELECT id FROM users WHERE email = $1`;
  const emailResult = await pool.query(searchEmailQuery, [email]);

  if (emailResult.rows.length > 0) {
    throw ApiError.conflict("User already registered!");
  }

  const hashedPassword = await hashToken(password);
  const id = crypto.randomUUID();

  const insertUserQuery = `
    INSERT INTO users (id,first_name, last_name, email, password_hash, role)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id, first_name, last_name, email, role
  `;

  const userResult = await pool.query(insertUserQuery, [
    id,
    firstName,
    lastName,
    email,
    hashedPassword,
    role,
  ]);

  if (userResult.rows.length === 0) {
    throw ApiError.internal("Internal server error");
  }

  return userResult.rows[0];
};

const loginService = async (payload) => {
  const { email, password } = payload;

  const checkUserQuery = `
    SELECT id,first_name,last_name, password_hash, role 
    FROM users 
    WHERE email=$1
  `;

  const userResult = await pool.query(checkUserQuery, [email]);
  if (userResult.rows.length === 0) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const user = userResult.rows[0];

  const isPassword = await verifyToken(password, user.password_hash);

  if (!isPassword) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const accessToken = generateAccessToken({ id: user.id, email });
  const refreshToken = generateRefreshToken({ id: user.id });

  const hashedRefreshToken = await hashToken(refreshToken)

  const updateUserQuery = 'UPDATE users SET refresh_token=$1 WHERE id=$2'
  await pool.query(updateUserQuery, [hashedRefreshToken, user.id])

  const safeUser = {
    first_name : user.first_name,
    last_name : user.last_name,
    email : email,
    role : user.role
  }

  return { safeUser, accessToken, refreshToken }
};

export { registerService,loginService };
