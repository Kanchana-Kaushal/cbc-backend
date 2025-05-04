import { Router } from "express";
import { createAdmin, signIn, signUp } from "../controllers/auth.controller.js";
import { verifyAdmin } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);

authRouter.post("/sign-in", signIn);

authRouter.post("/create-admin", verifyAdmin, createAdmin);

export default authRouter;
