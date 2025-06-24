import { Router } from "express";
import {
    createAdmin,
    googleLogin,
    signIn,
    signUp,
} from "../controllers/auth.controller.js";
import { verifyAdmin } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);

authRouter.post("/sign-in", signIn);

authRouter.post("/create-admin", verifyAdmin, createAdmin);

authRouter.post("/google-login", googleLogin);

export default authRouter;
