import { ApiError } from "../../utils/ApiError";
import { VehicleAvailability, VehicleType } from "../../types";

const VALID_TYPES: VehicleType[] = ["car", "bike", "van", "SUV"];
const VALID_STATUSES: VehicleAvailability[] = ["available", "booked"];

export interface CreateVehicleInput {
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status: VehicleAvailability;
}

export interface UpdateVehicleInput {
  vehicle_name?: string;
  type?: VehicleType;
  registration_number?: string;
  daily_rent_price?: number;
  availability_status?: VehicleAvailability;
}

export function validateCreateVehicle(body: any): CreateVehicleInput {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = body;

  if (!vehicle_name || !String(vehicle_name).trim()) {
    throw ApiError.badRequest("vehicle_name is required");
  }
  if (!type || !VALID_TYPES.includes(type)) {
    throw ApiError.badRequest(
      `type must be one of: ${VALID_TYPES.join(", ")}`
    );
  }
  if (!registration_number || !String(registration_number).trim()) {
    throw ApiError.badRequest("registration_number is required");
  }
  if (
    daily_rent_price === undefined ||
    daily_rent_price === null ||
    Number(daily_rent_price) <= 0
  ) {
    throw ApiError.badRequest("daily_rent_price must be a positive number");
  }
  const status = availability_status ?? "available";
  if (!VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest(
      `availability_status must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }

  return {
    vehicle_name: String(vehicle_name).trim(),
    type,
    registration_number: String(registration_number).trim(),
    daily_rent_price: Number(daily_rent_price),
    availability_status: status,
  };
}

export function validateUpdateVehicle(body: any): UpdateVehicleInput {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = body;

  const update: UpdateVehicleInput = {};

  if (vehicle_name !== undefined) {
    if (!String(vehicle_name).trim()) {
      throw ApiError.badRequest("vehicle_name cannot be empty");
    }
    update.vehicle_name = String(vehicle_name).trim();
  }

  if (type !== undefined) {
    if (!VALID_TYPES.includes(type)) {
      throw ApiError.badRequest(
        `type must be one of: ${VALID_TYPES.join(", ")}`
      );
    }
    update.type = type;
  }

  if (registration_number !== undefined) {
    if (!String(registration_number).trim()) {
      throw ApiError.badRequest("registration_number cannot be empty");
    }
    update.registration_number = String(registration_number).trim();
  }

  if (daily_rent_price !== undefined) {
    if (Number(daily_rent_price) <= 0) {
      throw ApiError.badRequest("daily_rent_price must be a positive number");
    }
    update.daily_rent_price = Number(daily_rent_price);
  }

  if (availability_status !== undefined) {
    if (!VALID_STATUSES.includes(availability_status)) {
      throw ApiError.badRequest(
        `availability_status must be one of: ${VALID_STATUSES.join(", ")}`
      );
    }
    update.availability_status = availability_status;
  }

  if (Object.keys(update).length === 0) {
    throw ApiError.badRequest("At least one field is required to update");
  }

  return update;
}

export function validateVehicleIdParam(param: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest("Invalid vehicleId");
  }
  return id;
}
