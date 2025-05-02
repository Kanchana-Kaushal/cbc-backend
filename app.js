import express from "express";
import { PORT, connString } from "./config/env.js";
import mongoose from "mongoose";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import orderRouter from "./routes/order.route.js";
import productRouter from "./routes/products.route.js";

const app = express();
app.use(express.json());

//routes
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

app.listen(PORT, async () => {
    console.log("Server is listening on PORT " + PORT);

    try {
        await mongoose.connect(connString);
        console.log("Database connected successfully");
    } catch (err) {
        console.error(err);
    }
});
