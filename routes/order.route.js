import { Router } from "express";
import { verifyUser, verifyAdmin } from "../middleware/auth.middleware.js";
import {
    placeOrder,
    getAllOrders,
    getOrderByUserId,
    getOrderById,
    updateStatus,
} from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.get("/:status", verifyAdmin, getAllOrders);

orderRouter.get("/:userId/my-orders", verifyUser, getOrderByUserId);

orderRouter.get("/order/:orderId", verifyUser, getOrderById);

orderRouter.post("/place-order", verifyUser, placeOrder);

orderRouter.put("/update/:orderId", verifyUser, updateStatus);

export default orderRouter;
