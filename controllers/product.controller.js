import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

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

export const getProductById = async (req, res, next) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            const err = new Error("Invalid ID or product not found");
            err.statusCode = 404;
            throw err;
        }

        const rawReviewInfo = await Promise.all(
            product.reviews.map(async (review) => {
                if (review.hidden === true) {
                    return;
                }

                const user = await User.findById(review.userId).select(
                    "avatar username"
                );

                if (!user) {
                    return null;
                }

                return {
                    review,
                    user,
                };
            })
        );

        const cleanedReviewInfo = rawReviewInfo.filter(Boolean);

        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: {
                product,
                reviews: cleanedReviewInfo,
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
    const { userId, rating, description } = req.body;

    try {
        const user = await User.findById(userId).select("avatar name");

        if (!user) {
            const err = new Error("Cannot find the user");
            err.statusCode = 404;
            throw err;
        }

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

        const rawReviewInfo = await Promise.all(
            product.reviews.map(async (review) => {
                const user = await User.findById(review.userId).select(
                    "avatar username"
                );

                if (!user) {
                    return null;
                }

                return {
                    review,
                    user,
                };
            })
        );

        const cleanedReviewInfo = rawReviewInfo.filter(Boolean);

        res.status(200).json({
            success: true,
            message: "Review added successfully",
            data: {
                product,
                reviews: cleanedReviewInfo,
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

export const searchProducts = async (req, res, next) => {
    const query = req.query.query;

    try {
        if (req.user) {
            const role = req.user.role;
            if (role === "admin") {
                const results = await Product.find(
                    query && query.trim() !== " "
                        ? {
                              $or: [
                                  { name: { $regex: query, $options: "i" } },
                                  {
                                      keywords: {
                                          $regex: query,
                                          $options: "i",
                                      },
                                  },
                                  {
                                      category: {
                                          $regex: query,
                                          $options: "i",
                                      },
                                  },
                                  {
                                      productId: {
                                          $regex: query,
                                          $options: "i",
                                      },
                                  },
                              ],
                          }
                        : {}
                )
                    .sort({ "inventory.available": 1 })
                    .select("-__v");

                res.status(200).json({
                    success: true,
                    message: "Products searched successfully",
                    products: results,
                });

                return;
            }
        }

        const results = await Product.find(
            query && query.trim() !== ""
                ? {
                      $or: [
                          { name: { $regex: query, $options: "i" } },
                          { keywords: { $regex: query, $options: "i" } },
                          { category: { $regex: query, $options: "i" } },
                      ],
                      "inventory.available": true,
                  }
                : { "inventory.available": true }
        )
            .sort({ createdAt: -1 })
            .select("-__v");

        res.status(200).json({
            success: true,
            message: "Products searched successfully",
            products: results,
        });
    } catch (err) {
        next(err);
    }
};

export const getCustomProducts = async (req, res, next) => {
    const criteria = req.body.criteria;
    try {
        if (req.user) {
            const role = req.user.role;

            if (role === "admin") {
                const products = await Product.find({ ...criteria })
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
            ...criteria,
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
