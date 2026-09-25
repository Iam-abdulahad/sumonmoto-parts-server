function createReviewController(reviewsCollection) {
  return {
    createReview: async (req, res) => {
      try {
        const review = req.body;
        if (!review.name || !review.email || !review.rating || !review.review) {
          return res.status(400).json({ message: "All fields are required." });
        }
        const result = await reviewsCollection.insertOne(review);
        res.status(201).json({ message: "Review added successfully", reviewId: result.insertedId });
      } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
    getReviews: async (req, res) => {
      try {
        const reviews = await reviewsCollection.find({}).toArray();
        res.status(200).json(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  };
}

module.exports = createReviewController;