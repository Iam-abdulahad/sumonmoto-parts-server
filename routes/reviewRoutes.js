const express = require("express");
const createReviewController = require("../controllers/reviewController");

function createReviewRoutes(reviewsCollection) {
  const router = express.Router();
  const controller = createReviewController(reviewsCollection);
  router.post("/reviews", controller.createReview);
  router.get("/reviews", controller.getReviews);
  return router;
}

module.exports = createReviewRoutes;