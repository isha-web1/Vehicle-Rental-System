import bcrypt from "bcryptjs";
import config from "../config";


export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, config.bcrypt.saltRounds);
}

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
