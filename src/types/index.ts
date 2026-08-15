export type UserRole = "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// Safe user shape returned to clients (never leaks password hash)
export type PublicUser = Omit<User, "password">;

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

// Augment Express's Request type so req.user is available after auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
