const express = require("express");
const createOrderController = require("../controllers/orderController");

function createOrderRoutes(ordersCollection) {
  const router = express.Router();
  const controller = createOrderController(ordersCollection);
  router.get("/orders", controller.getOrders);
  router.post("/orders", controller.createOrder);
  router.put("/orders/:id", controller.updateOrder);
  router.delete("/orders/:id", controller.deleteOrder);
  return router;
}

module.exports = createOrderRoutes;