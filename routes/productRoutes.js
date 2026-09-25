const express = require("express");
const createProductController = require("../controllers/productController");

function createProductRoutes(productCollection) {
  const router = express.Router();
  const controller = createProductController(productCollection);
  router.get("/products", controller.getProducts);
  router.get("/make_order/:id", controller.getProductForOrder);
  router.post("/products", controller.createProduct);
  router.patch("/products/:id", controller.updateProductQuantity);
  router.delete("/products/:id", controller.deleteProduct);
  return router;
}

module.exports = createProductRoutes;