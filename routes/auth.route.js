import { Router } from "express";

const authRouter = Router();

authRouter.post("/sign-up", (req, res) => res.send("Sign Up"));

authRouter.post("/sign-in", (req, res) => res.send("Sign Out"));

authRouter.post("/sign-out", (req, res) => res.send("Sign Out"));

authRouter.post("/create-admin", (req, res) => res.send("Create new admin"));

export default authRouter;
