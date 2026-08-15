export type UserRole = "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}



export type BookingStatus = "active" | "cancelled" | "returned";

export interface Booking {
  id: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: Date;
  rent_end_date: Date;
  total_price: number;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
}

// Safe user shape returned to clients (never leaks password hash)
export type PublicUser = Omit<User, "password">;

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}


export type VehicleType = "car" | "bike" | "van" | "SUV";
export type VehicleAvailability = "available" | "booked";

export interface Vehicle {
  id: number;
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status: VehicleAvailability;
  created_at: Date;
  updated_at: Date;
}

// Augment Express's Request type so req.user is available after auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
