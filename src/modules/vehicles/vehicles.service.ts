import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { Vehicle } from "../../types";
import { CreateVehicleInput, UpdateVehicleInput } from "./vehicles.validation";

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const existing = await pool.query(
    "SELECT id FROM vehicles WHERE registration_number = $1",
    [input.registration_number]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    throw ApiError.conflict(
      "A vehicle with this registration number already exists"
    );
  }

  const result = await pool.query<Vehicle>(
    `INSERT INTO vehicles
      (vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.vehicle_name,
      input.type,
      input.registration_number,
      input.daily_rent_price,
      input.availability_status,
    ]
  );

  const vehicle = result.rows[0];
  if (!vehicle) {
    throw ApiError.internal("Failed to create vehicle");
  }

  return vehicle;
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  const result = await pool.query<Vehicle>(
    "SELECT * FROM vehicles ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function getVehicleById(id: number): Promise<Vehicle> {
  const result = await pool.query<Vehicle>(
    "SELECT * FROM vehicles WHERE id = $1",
    [id]
  );

  if (result.rowCount === 0) {
    throw ApiError.notFound("Vehicle not found");
  }

  const vehicle = result.rows[0];
  if (!vehicle) {
    throw ApiError.notFound("Vehicle not found");
  }

  return vehicle;
}

export async function updateVehicle(
  id: number,
  input: UpdateVehicleInput
): Promise<Vehicle> {
  // Ensure the vehicle exists first, for a clean 404 instead of a silent no-op
  await getVehicleById(id);

  if (input.registration_number) {
    const existing = await pool.query(
      "SELECT id FROM vehicles WHERE registration_number = $1 AND id != $2",
      [input.registration_number, id]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      throw ApiError.conflict(
        "A vehicle with this registration number already exists"
      );
    }
  }

  const fields = Object.keys(input) as (keyof UpdateVehicleInput)[];
  const setClauses = fields.map((field, idx) => `${field} = $${idx + 1}`);
  const values = fields.map((field) => input[field]);

  const result = await pool.query<Vehicle>(
    `UPDATE vehicles
     SET ${setClauses.join(", ")}
     WHERE id = $${fields.length + 1}
     RETURNING *`,
    [...values, id]
  );

  const vehicle = result.rows[0];
  if (!vehicle) {
    throw ApiError.internal("Failed to update vehicle");
  }

  return vehicle;
}

export async function deleteVehicle(id: number): Promise<void> {
  await getVehicleById(id);

  const activeBookings = await pool.query(
    "SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active'",
    [id]
  );

  if (activeBookings.rowCount && activeBookings.rowCount > 0) {
    throw ApiError.conflict(
      "Cannot delete vehicle with active bookings"
    );
  }

  await pool.query("DELETE FROM vehicles WHERE id = $1", [id]);
}
