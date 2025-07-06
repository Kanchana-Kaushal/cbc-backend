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

        const lastOrderList = await Order.find()
            .sort({ createdAt: -1 })
            .limit(1);

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
    const status = req.params.status;
    const query = req.query.query;

    try {
        const orders = await Order.find(
            query && query.trim() !== ""
                ? {
                      status,
                      $or: [
                          { orderId: { $regex: query, $options: "i" } },
                          {
                              "deliveryDetails.address.city": {
                                  $regex: query,
                                  $options: "i",
                              },
                          },
                          {
                              "deliveryDetails.address.province": {
                                  $regex: query,
                                  $options: "i",
                              },
                          },
                          {
                              "deliveryDetails.address.country": {
                                  $regex: query,
                                  $options: "i",
                              },
                          },
                          {
                              "deliveryDetails.tel": {
                                  $regex: query,
                                  $options: "i",
                              },
                          },
                          {
                              "deliveryDetails.tel02": {
                                  $regex: query,
                                  $options: "i",
                              },
                          },
                          {
                              paymentMethod: {
                                  $regex: query,
                                  $options: "i",
                              },
                          },
                      ],
                  }
                : { status }
        )
            .sort({ createdAt: 1 })
            .select("-__v");

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

        const orders = await Order.find({ userId: userId }).sort({
            createdAt: -1,
        });

        if (orders.length > 0) {
            const detailedOrders = await Promise.all(
                orders.map(async (order) => {
                    const newProductDetails = await Promise.all(
                        order.products.map(async (product) => {
                            const productDetails = await Product.findById(
                                product.productId
                            ).select("name productId brand images category");

                            if (!productDetails) {
                                const err = new Error(
                                    "Some products in the order were not found"
                                );
                                err.statusCode = 404;
                                throw err;
                            }

                            return {
                                name: productDetails.name,
                                image: productDetails.images?.[0],
                                category: productDetails.category,
                                brand: productDetails.brand,
                                qty: product.qty,
                                priceCents: product.priceCents,
                            };
                        })
                    );

                    return { order, products: newProductDetails };
                })
            );

            res.status(200).json({
                success: true,
                message: "Orders fetched successfully",
                data: {
                    orders: detailedOrders,
                },
            });

            return;
        }

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: {
                orders: [],
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
        const orderQuery = role === "admin" ? { orderId } : { orderId, userId };
        const order = await Order.findOne(orderQuery);

        if (!order) {
            const err = new Error("Order not found");
            err.statusCode = 404;
            throw err;
        }

        const user = await User.findById(order.userId).select(
            "username email avatar -_id"
        );

        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        const newProductDetails = await Promise.all(
            order.products.map(async (product) => {
                const productDetails = await Product.findById(
                    product.productId
                ).select("name productId brand images category");

                if (!productDetails) {
                    const err = new Error(
                        "Some products in the order were not found"
                    );
                    err.statusCode = 404;
                    throw err;
                }

                return {
                    name: productDetails.name,
                    image: productDetails.images?.[0],
                    category: productDetails.category,
                    brand: productDetails.brand,
                    qty: product.qty,
                    priceCents: product.priceCents,
                };
            })
        );

        const detailedOrder = {
            order,
            products: newProductDetails,
            user,
        };

        res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: {
                order: detailedOrder,
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

    console.log(status);

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

            if (status === "cancelled") {
                await Promise.all(
                    orderExists.products.map(async (product) => {
                        const productExists = await Product.findById(
                            product.productId
                        );

                        const newStockLeft =
                            productExists.inventory.stockLeft + product.qty;
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
            }

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

        if (!orderExists.userId.equals(userId)) {
            const err = new Error("User unauthorized");
            err.statusCode = 403;
            throw err;
        }

        if (
            ["confirmed", "in-transit", "delivered"].includes(
                orderExists.status
            ) &&
            status === "cancelled"
        ) {
            const err = new Error("You cannot cancel order once its confirmed");
            err.statusCode = 403;
            throw err;
        }

        await Order.updateOne(
            { orderId },
            { $set: { status } },
            { runValidators: true }
        );

        if (status === "cancelled") {
            await Promise.all(
                orderExists.products.map(async (product) => {
                    const productExists = await Product.findById(
                        product.productId
                    );

                    const newStockLeft =
                        productExists.inventory.stockLeft + product.qty;
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
        }

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
