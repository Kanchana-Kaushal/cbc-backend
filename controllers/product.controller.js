import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const createNewProduct = async (req, res, next) => {
    const {
        name,
        description,
        images,
        category,
        brand,
        keywords,
        priceInfo,
        inventory,
    } = req.body;

    let productId;

    if (!priceInfo.markedPriceCents >= priceInfo.sellingPriceCents) {
        const err = new Error(
            "Selling price should be lower than Marked price."
        );
        err.statusCode = 400;
        throw err;
    }

    const lastProductList = await Product.find()
        .sort({ createdAt: -1 })
        .limit(1);

    if (lastProductList.length === 0) {
        productId = "PROD001";
    } else {
        const lastProduct = lastProductList[0];
        const lastProductId = lastProduct.productId; //"PROD0061"
        const lastProductNumber = lastProductId.replace("PROD", ""); //"0061"
        const lastProductNumberInt = parseInt(lastProductNumber); //61
        const newProductNumberInt = lastProductNumberInt + 1; //62
        const newProductNumberStr = newProductNumberInt
            .toString()
            .padStart(3, "0"); // "0062"

        productId = "PROD" + newProductNumberStr;
    }

    try {
        const product = new Product({
            productId,
            name,
            description,
            images,
            category,
            brand,
            keywords,
            priceInfo,
            inventory,
        });

        const newProduct = await product.save();

        res.status(200).json({
            success: true,
            message: "Product saved successfully",
            data: {
                product: newProduct,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        if (req.user) {
            const role = req.user.role;

            if (role === "admin") {
                const products = await Product.find()
                    .sort({ createdAt: -1 })
                    .select("-__v");

                res.status(200).json({
                    success: true,
                    message: "Products fetched successfully",
                    data: {
                        products,
                    },
                });

                return;
            }
        }

        const products = await Product.find({
            "inventory.available": true,
        })
            .sort({ createdAt: -1 })
            .select("-__v ");

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: {
                products,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getProductById = async (req, res, next) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            const err = new Error("Invalid ID or product not found");
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: {
                product,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (req, res, next) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            const err = new Error(
                "Invalid ID or product is already been deleted"
            );
            err.statusCode = 404;
            throw err;
        }

        const deleteInfo = await Product.deleteOne({ _id: productId });

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: {
                deleteInfo,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const addReview = async (req, res, next) => {
    const productId = req.params.productId;
    const { userId, rating, description, images } = req.body;

    try {
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            const err = new Error("Invalid ID or product does not exists");
            err.statusCode = 404;
            throw err;
        }

        const alreadyReviewed = existingProduct.reviews.some(
            (review) => review.userId.toString() === userId
        );

        if (alreadyReviewed) {
            const err = new Error("You have already reviewed this product");
            err.statusCode = 404;
            throw err;
        }

        const isProductPurchased = await Order.findOne({
            userId: userId,
            "products.productId": productId,
            status: "delivered",
        });

        if (!isProductPurchased) {
            const err = new Error(
                "You must purchase and recieve this product to leave a review"
            );
            err.statusCode = 404;
            throw err;
        }

        const currentRatingAvg = existingProduct.rating.average;
        const currentRatingCount = existingProduct.rating.count;
        const currentTotalStars = currentRatingAvg * currentRatingCount;

        const newTotalStars = currentTotalStars + rating;
        const newRatingCount = currentRatingCount + 1;
        const newRatingAvg = newTotalStars / newRatingCount;

        const newReview = {
            userId,
            rating,
            description,
            images,
        };

        const newRating = {
            average: newRatingAvg,
            count: newRatingCount,
        };

        const product = await Product.findByIdAndUpdate(
            productId,
            { $push: { reviews: newReview }, $set: { rating: newRating } },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Review added successfully",
            data: {
                product,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req, res, next) => {
    const productId = req.params.productId;
    const {
        name,
        description,
        images,
        category,
        brand,
        bestSeller,
        keywords,
        priceInfo,
        inventory,
    } = req.body;

    try {
        const existingproduct = await Product.findById(productId);

        if (!existingproduct) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }

        const updatefields = {
            name,
            description,
            images,
            category,
            brand,
            bestSeller,
            keywords,
            priceInfo,
            inventory,
        };

        const product = await Product.findByIdAndUpdate(
            productId,
            { $set: updatefields },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: {
                product,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const hideReview = async (req, res, next) => {
    const productId = req.params.productId;
    const { reviewId, hidden } = req.body;

    try {
        const existingproduct = await Product.findById(productId);

        if (!existingproduct) {
            const err = new Error("Product not found");
            err.statusCode = 404;
            throw err;
        }

        await Product.updateOne(
            { _id: productId, "reviews._id": reviewId },
            { $set: { "reviews.$.hidden": hidden } }
        );

        const product = await Product.findById(productId);

        res.status(200).json({
            success: true,
            message: `Review ${hidden ? "Hidden" : "Shown"} successfully`,
            data: {
                product,
            },
        });
    } catch (err) {
        next(err);
    }
};
