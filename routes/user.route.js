import { Router } from "express";
const userRouter = Router();

userRouter.get("/:page", (req, res) => res.send("Get all users"));

userRouter.get("/user/:id", (req, res) => res.send("Get all users by id"));

userRouter.put("/user/:id/update-account", (req, res) =>
    res.send("Update Account")
);

userRouter.put("/user/:id/ban-user", (req, res) => res.send("Ban User"));

export default userRouter;
