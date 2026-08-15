import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { Booking, JwtPayload, Vehicle } from "../../types";
import { CreateBookingInput } from "./bookings.validation";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function calculateDurationInDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
}

export async function createBooking(
  customerId: number,
  input: CreateBookingInput
): Promise<Booking> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const vehicleResult = await client.query<Vehicle>(
      "SELECT * FROM vehicles WHERE id = $1 FOR UPDATE",
      [input.vehicle_id]
    );

    const vehicle = vehicleResult.rows[0];
    if (!vehicle) {
      throw ApiError.notFound("Vehicle not found");
    }

    if (vehicle.availability_status !== "available") {
      throw ApiError.conflict("Vehicle is not available for booking");
    }

    const durationInDays = calculateDurationInDays(
      input.rent_start_date,
      input.rent_end_date
    );
    const totalPrice = Number(vehicle.daily_rent_price) * durationInDays;

    const bookingResult = await client.query<Booking>(
      `INSERT INTO bookings
        (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [
        customerId,
        input.vehicle_id,
        input.rent_start_date,
        input.rent_end_date,
        totalPrice,
      ]
    );

    const booking = bookingResult.rows[0];
    if (!booking) {
      throw ApiError.badRequest("Failed to create booking");
    }

    await client.query(
      "UPDATE vehicles SET availability_status = 'booked' WHERE id = $1",
      [input.vehicle_id]
    );

    await client.query("COMMIT");

    return booking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getBookingsForUser(
  user: JwtPayload
): Promise<Booking[]> {
  await autoExpireBookings();

  if (user.role === "admin") {
    const result = await pool.query<Booking>(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );
    return result.rows;
  }

  const result = await pool.query<Booking>(
    "SELECT * FROM bookings WHERE customer_id = $1 ORDER BY created_at DESC",
    [user.id]
  );
  return result.rows;
}

export async function getBookingById(id: number): Promise<Booking> {
  const result = await pool.query<Booking>(
    "SELECT * FROM bookings WHERE id = $1",
    [id]
  );

  const item = result.rows[0];

if (!item) {
  throw ApiError.notFound("Item not found");
}

return item;
}

export async function cancelBooking(
  bookingId: number,
  requesterId: number
): Promise<Booking> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<Booking>(
      "SELECT * FROM bookings WHERE id = $1 FOR UPDATE",
      [bookingId]
    );

    const booking = result.rows[0];

    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    if (booking.customer_id !== requesterId) {
      throw ApiError.forbidden("You can only cancel your own bookings");
    }

    if (booking.status !== "active") {
      throw ApiError.badRequest(`Booking is already ${booking.status}`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(booking.rent_start_date) <= today) {
      throw ApiError.badRequest(
        "Booking can only be cancelled before the rental start date"
      );
    }

    const updated = await client.query<Booking>(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [bookingId]
    );

    const updatedBooking = updated.rows[0];

    if (!updatedBooking) {
      throw ApiError.internal("Failed to cancel booking");
    }

    // Free the vehicle since the booking never started
    await client.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
      [booking.vehicle_id]
    );

    await client.query("COMMIT");

    return updatedBooking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function returnBooking(bookingId: number): Promise<Booking> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<Booking>(
      "SELECT * FROM bookings WHERE id = $1 FOR UPDATE",
      [bookingId]
    );

    const booking = result.rows[0];

    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    if (booking.status !== "active") {
      throw ApiError.badRequest(`Booking is already ${booking.status}`);
    }

    const updated = await client.query<Booking>(
      `UPDATE bookings SET status = 'returned', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [bookingId]
    );

    const updatedBooking = updated.rows[0];

    if (!updatedBooking) {
      throw ApiError.internal("Failed to return booking");
    }

    await client.query(
      "UPDATE vehicles SET availability_status = 'available' WHERE id = $1",
      [booking.vehicle_id]
    );

    await client.query("COMMIT");

    return updatedBooking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Auto-marks any "active" booking whose rent_end_date has passed as
 * "returned", and frees up the associated vehicle. Called lazily before
 * every booking list read; also safe to call on a periodic timer (see
 * server.ts) so it stays accurate even without incoming requests.
 */
export async function autoExpireBookings(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const expired = await client.query<Booking>(
      `UPDATE bookings
       SET status = 'returned', updated_at = NOW()
       WHERE status = 'active' AND rent_end_date < CURRENT_DATE
       RETURNING vehicle_id`
    );

    if (expired.rowCount && expired.rowCount > 0) {
      const vehicleIds = expired.rows.map((row) => row.vehicle_id);
      await client.query(
        `UPDATE vehicles SET availability_status = 'available'
         WHERE id = ANY($1::int[])`,
        [vehicleIds]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
