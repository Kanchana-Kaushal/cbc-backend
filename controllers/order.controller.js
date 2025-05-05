import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const placeOrder = async (req, res, next) => {
    const { userId, deliveryDetails, paymentMethod, products } = req.body;
    let orderId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        // Validate all products first before making any changes
        const checkedProducts = await Promise.all(
            products.map(async (product) => {
                const productExists = await Product.findById(product.productId);

                if (!productExists) {
                    const err = new Error(
                        "Some of your products were not found to process the order. Please try again later."
                    );
                    err.statusCode = 404;
                    throw err;
                }

                if (!productExists.inventory.available) {
                    const err = new Error("Product is not available");
                    err.statusCode = 404;
                    throw err;
                }

                if (product.qty > productExists.inventory.stockLeft) {
                    const err = new Error("Insufficient product amount");
                    err.statusCode = 404;
                    throw err;
                }

                return {
                    productId: product.productId,
                    qty: product.qty,
                    priceCents: productExists.priceInfo.sellingPriceCents,
                };
            })
        );

        const lastOrderList = await Order.find().sort({ date: -1 }).limit(1);

        if (lastOrderList.length === 0) {
            orderId = "ORD00001";
        } else {
            const lastOrder = lastOrderList[0];
            const lastOrderId = lastOrder.orderId; //"ORD0061"
            const lastOrderNumber = lastOrderId.replace("ORD", ""); //"0061"
            const lastOrderNumberInt = parseInt(lastOrderNumber); //61
            const newOrderNumberInt = lastOrderNumberInt + 1; //62
            const newOrderNumberStr = newOrderNumberInt
                .toString()
                .padStart(5, "0"); // "0062"

            orderId = "ORD" + newOrderNumberStr;
        }

        const newOrder = new Order({
            userId,
            orderId,
            deliveryDetails,
            paymentMethod,
            products: checkedProducts,
        });

        const order = await newOrder.save();

        // Update the inventory for each product
        await Promise.all(
            checkedProducts.map(async (product) => {
                const productExists = await Product.findById(product.productId);

                const newStockLeft =
                    productExists.inventory.stockLeft - product.qty;
                const available = newStockLeft > 0;

                await Product.updateOne(
                    { _id: productExists._id },
                    {
                        $set: {
                            "inventory.stockLeft": newStockLeft,
                            "inventory.available": available,
                        },
                    }
                );
            })
        );

        res.status(200).json({
            success: true,
            message: "Order placed successfully",
            data: {
                order,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getAllOrders = async (req, res, next) => {
    let status = req.params.status;

    try {
        const orders = await Order.find({ status }).sort({ date: -1 });
        const ordersCount = await Order.countDocuments({ status });

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: {
                orders,
                count: ordersCount,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getOrderByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    const tokenUserId = req.user.userId;

    if (tokenUserId !== userId) {
        const err = new Error("User unauthorized");
        err.statusCode = 403;
        throw err;
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            const err = new Error("User does not exists");
            err.statusCode = 404;
            throw err;
        }

        const orders = await Order.find({ userId: userId }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: {
                orders,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getOrderById = async (req, res, next) => {
    const orderId = req.params.orderId;
    const { userId, role } = req.user;

    try {
        if (role === "admin") {
            const order = await Order.findOne({ orderId });

            if (!order) {
                const err = new Error("Order Not found");
                err.statusCode = 404;
                throw err;
            }

            res.status(200).json({
                success: true,
                message: "Orders fetched successfully",
                data: {
                    order,
                },
            });

            return;
        }

        const order = await Order.findOne({ orderId, userId });

        if (!order) {
            const err = new Error("Order Not found");
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: {
                order,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const updateStatus = async (req, res, next) => {
    const orderId = req.params.orderId;
    const { userId, role } = req.user;
    const { status } = req.body;

    try {
        if (role === "admin") {
            const orderExists = await Order.findOne({ orderId });

            if (!orderExists) {
                const err = new Error("Order Not found");
                err.statusCode = 404;
                throw err;
            }

            await Order.updateOne(
                { orderId },
                { $set: { status } },
                { runValidators: true }
            );

            const order = await Order.findOne({ orderId });

            res.status(200).json({
                success: true,
                message: "Order Updated successfully",
                data: {
                    order,
                },
            });

            return;
        }

        const orderExists = await Order.findOne({ orderId });

        if (!orderExists) {
            const err = new Error("Order Not found");
            err.statusCode = 404;
            throw err;
        }

        if (!userId === orderExists.userId) {
            const err = new Error("User unauthoerized");
            err.statusCode = 403;
            throw err;
        }

        if (
            orderExists.status.includes("confirmed", "in-transit", "delivered")
        ) {
            const err = new Error("You cannot update order once its confirmed");
            err.statusCode = 403;
            throw err;
        }

        await Order.updateOne(
            { orderId },
            { $set: { status } },
            { runValidators: true }
        );

        const order = await Order.findOne({ orderId });

        res.status(200).json({
            success: true,
            message: "Order Updated successfully",
            data: {
                order,
            },
        });
    } catch (err) {
        next(err);
    }
};
