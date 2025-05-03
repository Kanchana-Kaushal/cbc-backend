import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },

        deliveryDetails: {
            address: {
                street: {
                    type: String,
                    required: [true, "Street is required"],
                    trim: true,
                },
                city: {
                    type: String,
                    required: [true, "City is required"],
                    trim: true,
                },
                province: {
                    type: String,
                    required: [true, "Province is required"],
                    trim: true,
                },
                postalCode: {
                    type: String,
                    required: [true, "Postal code is required"],
                    trim: true,
                },
                country: {
                    type: String,
                    required: [true, "Country is required"],
                    trim: true,
                },
            },

            tel: {
                type: String,
                required: true,
                min: 10,
            },

            tel02: {
                type: String,
                min: 10,
            },
        },

        paymentMethod: {
            type: String,
            required: true,
            enum: ["cod", "card"],
            default: "card",
        },

        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "Product",
                },
                priceCents: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                qty: {
                    type: Number,
                    required: true,
                    default: 1,
                    min: 1,
                    max: 100,
                },
            },
        ],

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "in-transit",
                "delivered",
                "cancelled",
            ],
            default: "pending",
            required: true,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
