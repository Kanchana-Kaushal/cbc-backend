import { Router } from "express";
import { verifyAdmin, verifyUser } from "../middleware/auth.middleware.js";
import {
    createNewProduct,
    deleteProduct,
    getProductById,
    addReview,
    updateProduct,
    hideReview,
    searchProducts,
    getCustomProducts,
    deleteReview,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post("/custom", getCustomProducts);

productRouter.get("/search", searchProducts);

productRouter.get("/:productId", getProductById);

productRouter.post("/add-new", verifyAdmin, createNewProduct);

productRouter.post("/:productId/add-review", verifyUser, addReview);

productRouter.delete("/:productId/reviews/:reviewId", verifyUser, deleteReview);

productRouter.delete("/:productId", verifyAdmin, deleteProduct);

productRouter.put("/:productId", verifyAdmin, updateProduct);

productRouter.put("/:productId/hide-review", verifyAdmin, hideReview);

export default productRouter;
