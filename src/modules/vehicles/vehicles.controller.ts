import { NextFunction, Request, Response } from "express";
import * as vehicleService from "./vehicles.service";
import {
  validateCreateVehicle,
  validateUpdateVehicle,
  validateVehicleIdParam,
} from "./vehicles.validation";


type VehicleIdParams = {
  vehicleId: string;
};

export async function createVehicleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = validateCreateVehicle(req.body);
    const vehicle = await vehicleService.createVehicle(input);

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllVehiclesController(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const vehicles = await vehicleService.getAllVehicles();

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (err) {
    next(err);
  }
}

export async function getVehicleByIdController(
  req: Request<VehicleIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validateVehicleIdParam(req.params.vehicleId);
    const vehicle = await vehicleService.getVehicleById(id);

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateVehicleController(
  req: Request<VehicleIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validateVehicleIdParam(req.params.vehicleId);
    const input = validateUpdateVehicle(req.body);
    const vehicle = await vehicleService.updateVehicle(id, input);

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicleController(
  req: Request<VehicleIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const id = validateVehicleIdParam(req.params.vehicleId);
    await vehicleService.deleteVehicle(id);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
