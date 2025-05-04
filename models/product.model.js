import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minLength: 2,
            maxLength: 50,
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            minLength: 2,
            maxLength: 500,
        },

        images: [
            {
                type: String,
                trim: true,
                lowercase: true,
                validate: {
                    validator: function (v) {
                        return /^(http|https):\/\/[^ "]+$/.test(v);
                    },
                    message: (props) => `${props.value} is not a valid URL`,
                },
            },
        ],

        category: {
            type: String,
            enum: [
                "skincare",
                "makeup",
                "haircare",
                "fragrance",
                "bath_body",
                "tools_accessories",
                "men",
                "gifts_sets",
            ],
            required: true,
            index: true,
        },

        brand: {
            type: String,
            required: true,
            index: true,
        },

        bestSeller: {
            type: Boolean,
            default: false,
        },

        keywords: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],

        priceInfo: {
            markedPriceCents: {
                type: Number,
                required: true,
                min: 0,
            },

            sellingPriceCents: {
                type: Number,
                required: true,
                min: 0,
            },
        },

        inventory: {
            available: {
                type: Boolean,
                default: true,
            },
            stockLeft: {
                type: Number,
                required: true,
                min: 0,
            },
        },

        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            count: {
                type: Number,
                default: 0,
                min: 0,
            },
        },

        reviews: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                description: {
                    type: String,
                    maxLength: 150,
                    required: true,
                },
                images: [
                    {
                        type: String,
                        trim: true,
                    },
                ],
                createdAt: {
                    type: Date,
                    default: Date.now,
                    immutable: true,
                },
                hidden: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

productSchema.pre("save", function (next) {
    this.inventory.available = this.inventory.stockLeft > 0;
    next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
