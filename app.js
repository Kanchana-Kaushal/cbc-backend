import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { PORT, connString, frontEndUrl } from "./config/env.js";
import { globalRateLimiter } from "./middleware/rateLimiter.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import orderRouter from "./routes/order.route.js";
import productRouter from "./routes/products.route.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
    cors({
        origin: frontEndUrl || "http://localhost:5173",
        credentials: true,
    })
);

app.use(morgan("dev"));

app.use(globalRateLimiter);

app.use(express.json());

app.use(authMiddleware);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Resource not found",
    });
});

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
