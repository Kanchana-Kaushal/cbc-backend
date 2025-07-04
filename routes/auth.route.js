import { Router } from "express";
import {
    changePassword,
    checkAdmin,
    checkUser,
    createAdmin,
    googleLogin,
    sendVerificationCode,
    signIn,
    signUp,
} from "../controllers/auth.controller.js";
import { verifyAdmin, verifyCode } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimiter.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", verifyCode, authRateLimiter, signUp);

authRouter.post("/sign-in", authRateLimiter, signIn);

authRouter.get("/check-admin", checkAdmin);

authRouter.post("/check-user", checkUser);

authRouter.post("/create-admin", verifyAdmin, createAdmin);

authRouter.post("/google-login", authRateLimiter, googleLogin);

authRouter.post("/send-code", authRateLimiter, sendVerificationCode);

authRouter.put(
    "/user/change-password",
    verifyCode,
    authRateLimiter,
    changePassword
);

export default authRouter;
