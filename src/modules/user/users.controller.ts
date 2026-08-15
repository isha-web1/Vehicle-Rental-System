import { NextFunction, Request, Response } from "express";
import * as userService from "./users.service";
import { validateUpdateUser, validateUserIdParam } from "./users.validation";

type UserIdParams = {
  userId: string;
};


export async function getAllUsersController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserController(
  req: Request<UserIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validateUserIdParam(req.params.userId);

    // req.user is guaranteed by `authenticate`, which runs before this
    const isAdmin = req.user!.role === "admin";
    const input = validateUpdateUser(req.body, isAdmin);

    const user = await userService.updateUser(id, input);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserController(
  req: Request<UserIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validateUserIdParam(req.params.userId);
    await userService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
