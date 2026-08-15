import express, { Request, Response } from "express";
import initDB from "./config/db";
import authRoutes from "./modules/auth/auth.routes";
import vehicleRoutes from "./modules/vehicles/vehicles.routes";
import userRoutes from "./modules/user/users.routes";



const app = express();
// parser
app.use(express.json());
// app.use(express.urlencoded());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/users", userRoutes);

// initializing DB
initDB();

// "/" -> localhost:5000/
app.get("/", (req: Request, res: Response) => {
  res.send("Hello Next Level Developers!");
});



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;