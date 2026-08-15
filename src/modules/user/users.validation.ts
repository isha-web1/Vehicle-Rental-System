import { ApiError } from "../../utils/ApiError";
import { UserRole } from "../../types";

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES: UserRole[] = ["admin", "customer"];

/**
 * Validates the update payload. `isAdmin` controls whether `role` is
 * accepted at all — a customer updating their own profile must never
 * be able to change their role, even if they include it in the body.
 */
export function validateUpdateUser(
  body: any,
  isAdmin: boolean
): UpdateUserInput {
  const { name, email, phone, password, role } = body;

  const update: UpdateUserInput = {};

  if (name !== undefined) {
    if (!String(name).trim()) {
      throw ApiError.badRequest("name cannot be empty");
    }
    update.name = String(name).trim();
  }

  if (email !== undefined) {
    if (!EMAIL_REGEX.test(email)) {
      throw ApiError.badRequest("A valid email is required");
    }
    update.email = String(email).trim().toLowerCase();
  }

  if (phone !== undefined) {
    if (!String(phone).trim()) {
      throw ApiError.badRequest("phone cannot be empty");
    }
    update.phone = String(phone).trim();
  }

  if (password !== undefined) {
    if (String(password).length < 6) {
      throw ApiError.badRequest("Password must be at least 6 characters");
    }
    update.password = password;
  }

  if (role !== undefined) {
    if (!isAdmin) {
      throw ApiError.forbidden("Only an admin can change a user's role");
    }
    if (!VALID_ROLES.includes(role)) {
      throw ApiError.badRequest(
        `role must be one of: ${VALID_ROLES.join(", ")}`
      );
    }
    update.role = role;
  }

  if (Object.keys(update).length === 0) {
    throw ApiError.badRequest("At least one field is required to update");
  }

  return update;
}

export function validateUserIdParam(param: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest("Invalid userId");
  }
  return id;
}
