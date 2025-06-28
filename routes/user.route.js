import { Router } from "express";
import {
    verifyAdmin,
    verifyCode,
    verifyUser,
} from "../middleware/auth.middleware.js";
import {
    banUser,
    getAllAdmins,
    getAllUsers,
    getUserById,
    updateUserAvatar,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/", verifyAdmin, getAllUsers);

userRouter.get("/admins", verifyAdmin, getAllAdmins);

userRouter.get("/user/:id", verifyUser, getUserById);

userRouter.put("/user/:id/update-user", verifyUser, updateUserAvatar);

userRouter.put("/ban-user", verifyAdmin, banUser);

export default userRouter;
