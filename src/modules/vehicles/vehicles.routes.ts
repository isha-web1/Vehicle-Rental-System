import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  createVehicleController,
  deleteVehicleController,
  getAllVehiclesController,
  getVehicleByIdController,
  updateVehicleController,
} from "./vehicles.controller";

const router = Router();

// POST /api/v1/vehicles - Admin only
router.post("/", authenticate, authorize("admin"), createVehicleController);

// GET /api/v1/vehicles - Public
router.get("/", getAllVehiclesController);

// GET /api/v1/vehicles/:vehicleId - Public
router.get("/:vehicleId", getVehicleByIdController);

// PUT /api/v1/vehicles/:vehicleId - Admin only
router.put(
  "/:vehicleId",
  authenticate,
  authorize("admin"),
  updateVehicleController
);

// DELETE /api/v1/vehicles/:vehicleId - Admin only
router.delete(
  "/:vehicleId",
  authenticate,
  authorize("admin"),
  deleteVehicleController
);

export default router;
