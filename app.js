import express from "express";
import { PORT, connString, frontEndUrl } from "./config/env.js";
import mongoose from "mongoose";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import orderRouter from "./routes/order.route.js";
import productRouter from "./routes/products.route.js";
import errorHandler from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import cors from "cors";
import { globalRateLimiter } from "./middleware/rateLimiter.middleware.js";
import morgan from "morgan";

const app = express();
app.set("trust proxy", 1);

app.use(
    cors({
        origin: frontEndUrl, //frontEndUrl, "http://localhost:5173"
    })
);

app.use(morgan("dev"));
app.use(globalRateLimiter);
app.use(authMiddleware);
app.use(express.json());

//routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

//This middleware will handle invalid requests
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Resource not found",
    });
});

//This middleware will work if a error happens
app.use(errorHandler);

app.listen(PORT, async () => {
    console.log("Server is listening on PORT " + PORT);
    try {
        await mongoose.connect(connString);
        console.log("Database connected successfully");
    } catch (err) {
        console.error(err);
    }
});
