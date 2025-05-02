import { Router } from "express";
const orderRouter = Router();

orderRouter.get("/:page", (req, res) => res.send("get all orders"));

orderRouter.get("/:userId/my-orders", (req, res) =>
    res.send("get all orders by user id")
);

orderRouter.get("/:orderId", (req, res) => res.send("Get order details"));

orderRouter.post("/place-order", (req, res) => res.send("Place order"));

orderRouter.put("/order/:orderId", (req, res) =>
    res.send("Update order status")
);

export default orderRouter;
