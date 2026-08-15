import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

const config = {
  connection_str: process.env.CONNECTION_STR,
  port: Number(process.env.PORT) || 5000,
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  bcrypt: {
    saltRounds: Number(process.env.SALT_ROUNDS) || 10,
  },
};

export default config;
