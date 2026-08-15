import { Router } from "express";
import { signupController } from "./auth.controller";

const router = Router();

// POST /api/v1/auth/signup - Public - Register new user account
router.post("/signup", signupController);



export default router;