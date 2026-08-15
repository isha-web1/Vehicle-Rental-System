import { Router } from "express";
import {
  authenticate,
  authorize,
  authorizeSelfOrAdmin,
} from "../../middlewares/auth.middleware";
import {
  deleteUserController,
  getAllUsersController,
  updateUserController,
} from "./users.controller";

const router = Router();

// GET /api/v1/users - Admin only
router.get("/", authenticate, authorize("admin"), getAllUsersController);

// PUT /api/v1/users/:userId - Admin (any user) or the user themself (own profile only)
router.put(
  "/:userId",
  authenticate,
  authorizeSelfOrAdmin("userId"),
  updateUserController
);

// DELETE /api/v1/users/:userId - Admin only
router.delete(
  "/:userId",
  authenticate,
  authorize("admin"),
  deleteUserController
);

export default router;
