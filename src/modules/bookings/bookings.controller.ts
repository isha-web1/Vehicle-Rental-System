import { NextFunction, Request, Response } from "express";
import * as bookingService from "./bookings.service";
import { ApiError } from "../../utils/ApiError";
import {
  validateBookingAction,
  validateBookingIdParam,
  validateCreateBooking,
} from "./bookings.validation";


type BookingIdParams = {
  bookingId: string;
};

export async function createBookingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = validateCreateBooking(req.body);
    const booking = await bookingService.createBooking(req.user!.id, input);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const bookings = await bookingService.getBookingsForUser(req.user!);

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Role-based single endpoint:
 *  - Customer sends { "action": "cancel" } to cancel their own booking
 *    (only allowed before the rental start date).
 *  - Admin sends { "action": "return" } to mark a booking as returned,
 *    which frees the vehicle back to "available".
 */
export async function updateBookingController(
  req: Request<BookingIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const bookingId = validateBookingIdParam(req.params.bookingId);
    const action = validateBookingAction(req.body);
    const isAdmin = req.user!.role === "admin";

    if (action === "cancel") {
      if (isAdmin) {
        throw ApiError.forbidden(
          "Admins mark bookings as returned, not cancel them"
        );
      }
      const booking = await bookingService.cancelBooking(
        bookingId,
        req.user!.id
      );
      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking,
      });
    }

    // action === "return"
    if (!isAdmin) {
      throw ApiError.forbidden("Only an admin can mark a booking as returned");
    }
    const booking = await bookingService.returnBooking(bookingId);
    res.status(200).json({
      success: true,
      message: "Booking marked as returned successfully",
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}
