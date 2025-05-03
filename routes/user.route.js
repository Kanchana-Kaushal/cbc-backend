import { Router } from "express";
import { verifyAdmin, verifyUser } from "../middleware/auth.middleware.js";
import {
    banUser,
    getAllUsers,
    getUserById,
    updateUser,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/:page", verifyAdmin, getAllUsers);

userRouter.get("/user/:id", verifyUser, getUserById);

userRouter.put("/user/:id/update-user", verifyUser, updateUser);

userRouter.put("/user/:id/ban-user", verifyAdmin, banUser);

export default userRouter;
