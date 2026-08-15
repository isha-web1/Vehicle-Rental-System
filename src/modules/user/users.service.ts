import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../utils/password";
import { PublicUser, User } from "../../types";
import { UpdateUserInput } from "./users.validation";

function toPublicUser(user: User): PublicUser {
  const { password, ...publicUser } = user;
  return publicUser;
}

export async function getAllUsers(): Promise<PublicUser[]> {
  const result = await pool.query<User>(
    "SELECT * FROM users ORDER BY created_at DESC"
  );
  return result.rows.map(toPublicUser);
}

export async function getUserById(id: number): Promise<User> {
  const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [
    id,
  ]);

  const user = result.rows[0];
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return user;
}

export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<PublicUser> {
  await getUserById(id); // 404 if the target user doesn't exist

  if (input.email) {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [input.email, id]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      throw ApiError.conflict("An account with this email already exists");
    }
  }

  const updateData: Record<string, unknown> = { ...input };
  if (updateData.password) {
    updateData.password = await hashPassword(input.password as string);
  }

  const fields = Object.keys(updateData);
  const setClauses = fields.map((field, idx) => `${field} = $${idx + 1}`);
  const values = fields.map((field) => updateData[field]);

  const result = await pool.query<User>(
    `UPDATE users
     SET ${setClauses.join(", ")}, updated_at = NOW()
     WHERE id = $${fields.length + 1}
     RETURNING *`,
    [...values, id]
  );

  const user = result.rows[0];

if (!user) {
  throw ApiError.notFound("User not found");
}

return toPublicUser(user);
}

export async function deleteUser(id: number): Promise<void> {
  await getUserById(id);

  const activeBookings = await pool.query(
    "SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'",
    [id]
  );

  if (activeBookings.rowCount && activeBookings.rowCount > 0) {
    throw ApiError.conflict("Cannot delete user with active bookings");
  }

  await pool.query("DELETE FROM users WHERE id = $1", [id]);
}
