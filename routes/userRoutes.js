const express = require("express");
const createUserController = require("../controllers/userController");

function createUserRoutes(usersCollection) {
  const router = express.Router();
  const controller = createUserController(usersCollection);
  router.post("/users", controller.createUser);
  router.get("/users", controller.getUsers);
  router.get("/user/:uid", controller.getUser);
  router.put("/users/:uid", controller.updateUser);
  router.delete("/users/:uid", controller.deleteUser);
  return router;
}

module.exports = createUserRoutes;