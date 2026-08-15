import { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service";
import { validateSignin, validateSignup } from "./auth.validation";


export async function signupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = validateSignup(req.body);
    const { user, token } = await authService.signup(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}