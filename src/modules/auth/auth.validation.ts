import { ApiError } from "../../utils/ApiError";

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface SigninInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// NOTE: role is intentionally NOT accepted from the client here.
// Public signup always creates a "customer" — this prevents anyone from
// self-registering as "admin". Promote users to admin via a separate,
// admin-only endpoint (PUT /api/v1/users/:userId) instead.
export function validateSignup(body: Partial<SignupInput>): SignupInput {
  const { name, email, password, phone } = body;

  if (!name || !name.trim()) {
    throw ApiError.badRequest("Name is required");
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw ApiError.badRequest("A valid email is required");
  }
  if (!password || password.length < 6) {
    throw ApiError.badRequest("Password must be at least 6 characters");
  }
  if (!phone || !phone.trim()) {
    throw ApiError.badRequest("Phone is required");
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone: phone.trim(),
  };
}

export function validateSignin(body: Partial<SigninInput>): SigninInput {
  const { email, password } = body;

  if (!email || !EMAIL_REGEX.test(email)) {
    throw ApiError.badRequest("A valid email is required");
  }
  if (!password) {
    throw ApiError.badRequest("Password is required");
  }

  return { email: email.trim().toLowerCase(), password };
}
