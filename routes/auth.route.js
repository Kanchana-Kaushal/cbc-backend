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

const authRouter = Router();

authRouter.post("/sign-up", verifyCode, signUp);

authRouter.post("/sign-in", signIn);

authRouter.get("/check-admin", checkAdmin);

authRouter.post("/check-user", checkUser);

authRouter.post("/create-admin", verifyAdmin, createAdmin);

authRouter.post("/google-login", googleLogin);

authRouter.post("/send-code", sendVerificationCode);

authRouter.put("/user/change-password", verifyCode, changePassword);

export default authRouter;
