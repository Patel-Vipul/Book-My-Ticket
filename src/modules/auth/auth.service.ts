import pool from "../../common/config/database/db.js";
import ApiError from "../../common/utils/api.error.js";
import { hashToken,verifyToken } from "../../common/utils/hashToken.js";
import crypto from "crypto";

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
  if(userResult.rows.length === 0){
    throw ApiError.unauthorized("Invalid email or password")
  }
};

export { registerService };
