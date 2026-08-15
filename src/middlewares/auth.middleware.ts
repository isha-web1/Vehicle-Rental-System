import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../types";

/**
 * Verifies the Bearer token from the Authorization header and attaches
 * the decoded payload to req.user. Returns 401 if missing/invalid.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or malformed Authorization header");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw ApiError.unauthorized("Missing token");
    }
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (err) {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

/**
 * Restricts access to the given roles. Must run after `authenticate`.
 * Usage: authorize("admin") or authorize("admin", "customer")
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden("You do not have permission to perform this action"),
      );
    }

    next();
  };
}

/**
 * Allows access if the requester is an admin OR is acting on their own
 * resource (e.g. PUT /users/:userId). Useful for the "Admin or Own" rule.
 */
export function authorizeSelfOrAdmin(paramName = "userId") {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const targetId = Number(req.params[paramName]);
    const isSelf = req.user.id === targetId;
    const isAdmin = req.user.role === "admin";

    if (!isSelf && !isAdmin) {
      return next(ApiError.forbidden("You can only modify your own account"));
    }

    next();
  };
}
