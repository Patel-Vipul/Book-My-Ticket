import bcrypt from "bcrypt";

const SALT_ROUND = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUND);
}

async function verifyPassword(
  textPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(textPassword, hashedPassword);
}

export { hashPassword, verifyPassword };
