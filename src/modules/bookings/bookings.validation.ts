import { ApiError } from "../../utils/ApiError";

export interface CreateBookingInput {
  vehicle_id: number;
  rent_start_date: string; // ISO date string, e.g. "2026-08-20"
  rent_end_date: string;
}

export function validateCreateBooking(body: any): CreateBookingInput {
  const { vehicle_id, rent_start_date, rent_end_date } = body;

  if (!vehicle_id || !Number.isInteger(Number(vehicle_id))) {
    throw ApiError.badRequest("vehicle_id is required and must be an integer");
  }
  if (!rent_start_date || isNaN(Date.parse(rent_start_date))) {
    throw ApiError.badRequest("rent_start_date is required and must be a valid date");
  }
  if (!rent_end_date || isNaN(Date.parse(rent_end_date))) {
    throw ApiError.badRequest("rent_end_date is required and must be a valid date");
  }

  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);

  // Normalize to midnight so "today" comparisons aren't affected by time-of-day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    throw ApiError.badRequest("rent_start_date cannot be in the past");
  }
  if (end <= start) {
    throw ApiError.badRequest("rent_end_date must be after rent_start_date");
  }

  return {
    vehicle_id: Number(vehicle_id),
    rent_start_date,
    rent_end_date,
  };
}

export function validateBookingIdParam(param: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest("Invalid bookingId");
  }
  return id;
}

export type BookingAction = "cancel" | "return";

/**
 * Body shape for PUT /bookings/:bookingId is: { "action": "cancel" | "return" }
 * The controller enforces which action each role is allowed to perform.
 */
export function validateBookingAction(body: any): BookingAction {
  const { action } = body;

  if (action !== "cancel" && action !== "return") {
    throw ApiError.badRequest("action must be either 'cancel' or 'return'");
  }

  return action;
}
