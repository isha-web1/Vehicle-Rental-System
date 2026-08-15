import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { hashPassword, comparePassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import { PublicUser, User } from "../../types";
import { SigninInput, SignupInput } from "./auth.validation";

function toPublicUser(user: User): PublicUser {
  const { password, ...publicUser } = user;
  return publicUser;
}

export async function signup(input: SignupInput): Promise<{
  user: PublicUser;
  token: string;
}> {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    input.email,
  ]);

  if (existing.rowCount && existing.rowCount > 0) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, name, email, password, phone, role, created_at, updated_at`,
    [input.name, input.email, hashedPassword, input.phone],
  );

  const user = result.rows[0];
  if (!user) {
    throw ApiError.internal("Failed to create user");
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { user: toPublicUser(user), token };
}



// signin function
export async function signin(input: SigninInput): Promise<{
  user: PublicUser;
  token: string;
}> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [input.email]
  );

  const user = result.rows[0];

  // Same error for "no user" and "wrong password" — avoids leaking
  // which emails are registered.
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(input.password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { user: toPublicUser(user), token };
}

