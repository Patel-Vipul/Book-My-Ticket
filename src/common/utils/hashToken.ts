import bcrypt from "bcrypt";

const SALT_ROUND = 10;

async function hashToken(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUND);
}

async function verifyToken(
  textPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(textPassword, hashedPassword);
}

export { hashToken, verifyToken };
