import { Router } from "express";
const userRouter = Router();

userRouter.get("/:page", (req, res) => res.send("Get all users"));

userRouter.get("/user/:id", (req, res) => res.send("Get all users"));

userRouter.put("/user/:id/update-account", (req, res) =>
    res.send("Update Account")
);

userRouter.delete("/user/:id", (req, res) => res.send("Delete user"));

export default userRouter;
