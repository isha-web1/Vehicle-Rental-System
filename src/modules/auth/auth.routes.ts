import { Router } from "express";
import { signinController, signupController } from "./auth.controller";

const router = Router();

// POST /api/v1/auth/signup - Public - Register new user account
router.post("/signup", signupController);


// POST /api/v1/auth/signin - Public - Login and receive JWT token
router.post("/signin", signinController);



export default router;