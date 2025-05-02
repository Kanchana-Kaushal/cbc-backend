import { Router } from "express";
const productRouter = Router();

productRouter.get("/", (req, res) => res.send("Get all products"));

productRouter.get("/:productId", (req, res) => res.send("Get one product"));

productRouter.post("/add-new", (req, res) => res.send("Add new product"));

productRouter.post("/:productId/add-review", (req, res) =>
    res.send("Add review")
);

productRouter.delete("/:productId", (req, res) => res.send("Delete product"));

productRouter.post("/:productId", (req, res) => res.send("Update product"));

export default productRouter;
