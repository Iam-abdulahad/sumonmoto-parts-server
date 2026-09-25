const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDatabase } = require("./config/database");
const createUserRoutes = require("./routes/userRoutes");
const createProductRoutes = require("./routes/productRoutes");
const createOrderRoutes = require("./routes/orderRoutes");
const createReviewRoutes = require("./routes/reviewRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://sumonmoto-parts.web.app"],
    credentials: true,
  })
);
app.use(express.json());

async function run() {
  try {
    const {
      productCollection,
      usersCollection,
      ordersCollection,
      reviewsCollection,
    } = await connectDatabase();
    console.log("Connected to MongoDB!");

    app.use(createUserRoutes(usersCollection));
    app.use(createProductRoutes(productCollection));
    app.use(createOrderRoutes(ordersCollection));
    app.use(createReviewRoutes(reviewsCollection));

    app.listen(port, () => console.log(`Server is running on port ${port}`));
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();