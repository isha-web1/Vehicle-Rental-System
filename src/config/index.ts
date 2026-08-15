import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  connection_str: process.env.CONNECTION_STR,
  port: process.env.PORT,
  jwt: {
    secret: require("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  bcrypt: {
    saltRounds: Number(process.env.SALT_ROUNDS) || 10,
  },
  
};

export default config;