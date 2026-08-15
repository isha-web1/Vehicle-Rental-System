import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  createBookingController,
  getBookingsController,
  updateBookingController,
} from "./bookings.controller";

const router = Router();

// POST /api/v1/bookings - Customer or Admin
router.post(
  "/",
  authenticate,
  authorize("admin", "customer"),
  createBookingController
);

// GET /api/v1/bookings - Role-based (admin: all, customer: own only — handled in service)
router.get(
  "/",
  authenticate,
  authorize("admin", "customer"),
  getBookingsController
);

// PUT /api/v1/bookings/:bookingId - Role-based (customer: cancel, admin: return)
router.put(
  "/:bookingId",
  authenticate,
  authorize("admin", "customer"),
  updateBookingController
);

export default router;
