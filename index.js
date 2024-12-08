const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://sumonmoto-parts.web.app"], // Allow both local and deployed frontend
    credentials: true, // To allow cookies and other credentials
  })
);
app.use(express.json());

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sumonmotoparts.14hpqnx.mongodb.net/?retryWrites=true&w=majority&appName=SumonMotoParts`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Generate JWT
function generateToken(user) {
  return jwt.sign({ uid: user.uid, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

// JWT Middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
}

// Run the server with MongoDB connection
async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("SumonMoto");
    const productCollection = db.collection("products");
    const usersCollection = db.collection("users");
    const ordersCollection = db.collection("orders");
    const reviewsCollection = db.collection("reviews");

    // User routes
    app.post("/users", async (req, res) => {
      const { uid, email, name, photoURL, socialAccount, phone, role } =
        req.body;
      try {
        const existingUser = await usersCollection.findOne({
          $or: [{ email }, { uid }],
        });
        if (existingUser) {
          const token = generateToken(existingUser);
          return res
            .status(200)
            .json({ message: "Login successful", token, user: existingUser });
        }
        const newUser = {
          uid,
          email,
          name,
          photoURL,
          socialAccount,
          phone,
          role,
        };
        await usersCollection.insertOne(newUser);
        const token = generateToken(newUser);
        res.status(201).json({
          message: "User registered successfully",
          token,
          user: newUser,
        });
      } catch (error) {
        console.error("Error during login/register:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
      }
    });

    app.get("/user/:uid", async (req, res) => {
      const { uid } = req.params;
      try {
        const user = await usersCollection.findOne({ uid });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.put("/users/:uid", async (req, res) => {
      const userUid = req.params.uid;
      const { toggleRole, ...updatedData } = req.body; // Extract toggleRole flag

      try {
        // Find the user in the database
        const user = await usersCollection.findOne({ uid: userUid });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Handle role toggling if toggleRole flag is present
        if (toggleRole) {
          const newRole = user.role === "admin" ? "user" : "admin";

          await usersCollection.updateOne(
            { uid: userUid },
            { $set: { role: newRole } }
          );

          return res.json({
            message: "User role toggled successfully",
            role: newRole,
          });
        }

        // Handle general updates (other fields including role)
        const result = await usersCollection.updateOne(
          { uid: userUid },
          { $set: updatedData }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).json({ message: "No changes were made" });
        }

        const updatedUser = await usersCollection.findOne({ uid: userUid });
        res.json({
          message: "User information updated successfully",
          data: updatedUser,
        });
      } catch (error) {
        console.error("Error updating user info:", error);
        res.status(500).json({ message: "Failed to update user info", error });
      }
    });

    app.delete("/users/:uid", async (req, res) => {
      const userUid = req.params.uid;
      try {
        const result = await usersCollection.deleteOne({ uid: userUid });
        if (result.deletedCount === 0)
          return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user", error });
      }
    });

    // Product routes
    app.get("/products", async (req, res) => {
      try {
        const products = await productCollection.find().toArray();
        res.json(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
      }
    });

    app.get("/make_order/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!product)
          return res.status(404).json({ message: "Product not found" });
        res.json(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Error fetching product" });
      }
    });

    app.post("/products", async (req, res) => {
      try {
        const {
          name,
          price,
          available_quantity,
          minimum_order_quantity,
          description,
          image,
        } = req.body;
        if (
          !name ||
          !price ||
          !available_quantity ||
          !minimum_order_quantity ||
          !description ||
          !image
        ) {
          return res.status(400).json({ error: "All fields are required" });
        }
        const newProduct = {
          name,
          price,
          available_quantity,
          minimum_order_quantity,
          description,
          image,
        };
        const result = await productCollection.insertOne(newProduct);
        res.status(201).json({
          message: "Product created successfully",
          product: { _id: result.insertedId, ...newProduct },
        });
      } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/products/:id", async (req, res) => {
      const { id } = req.params; // Product ID from URL
      const { quantity, action } = req.body; // Quantity and action (add or deduct)

      try {
        // Validate ID
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid product ID" });
        }

        // Validate action
        if (!["add", "deduct"].includes(action)) {
          return res
            .status(400)
            .json({ message: "Invalid action. Use 'add' or 'deduct'." });
        }

        // Validate quantity
        if (typeof quantity !== "number" || quantity <= 0) {
          return res
            .status(400)
            .json({ message: "Quantity must be a positive number." });
        }

        // Find product in database
        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!product) {
          return res.status(404).json({ message: "Product not found." });
        }

        // Ensure available_quantity is a valid number
        if (typeof product.available_quantity !== "number") {
          return res
            .status(500)
            .json({ message: "Invalid available_quantity in database." });
        }

        // Check stock availability if action is "deduct"
        if (action === "deduct" && product.available_quantity < quantity) {
          return res.status(400).json({
            message: `Insufficient stock. Current stock: ${product.available_quantity}`,
          });
        }

        // Update quantity
        const updateQuery =
          action === "add"
            ? { $inc: { available_quantity: quantity } } // Add quantity
            : { $inc: { available_quantity: -quantity } }; // Deduct quantity

        const updateResult = await productCollection.updateOne(
          { _id: new ObjectId(id) },
          updateQuery
        );

        if (updateResult.modifiedCount === 1) {
          const updatedProduct = await productCollection.findOne({
            _id: new ObjectId(id),
          });
          return res.json({
            message: "Product quantity updated successfully.",
            productId: id,
            available_quantity: updatedProduct.available_quantity,
          });
        } else {
          return res
            .status(500)
            .json({ message: "Failed to update product quantity." });
        }
      } catch (error) {
        console.error("Error updating product quantity:", error);
        res.status(500).json({ message: "Internal server error." });
      }
    });

    app.delete("/products/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await productCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0)
          return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    });

    // Order routes
    app.get("/orders", async (req, res) => {
      try {
        const orders = await ordersCollection.find().toArray();
        res.json(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders" });
      }
    });

    app.post("/orders", async (req, res) => {
      try {
        const {
          orderId,
          productName,
          price,
          totalPrice,
          quantity,
          customerName,
          customerEmail,
          shippingInfo,
          contactInfo,
          status,
        } = req.body;
        if (
          !orderId ||
          !productName ||
          !price ||
          !totalPrice ||
          !quantity ||
          !customerName ||
          !customerEmail ||
          !shippingInfo ||
          !contactInfo ||
          !status
        ) {
          return res.status(400).json({ error: "All fields are required" });
        }
        const newOrder = {
          orderId,
          productName,
          price,
          totalPrice,
          quantity,
          customerName,
          customerEmail,
          shippingInfo,
          contactInfo,
          orderTime: new Date().toISOString(),
          status,
        };
        const result = await ordersCollection.insertOne(newOrder);
        res.status(201).json({
          message: "Order placed successfully",
          order: { _id: result.insertedId, ...newOrder },
        });
      } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.put("/orders/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid order ID" });
      try {
        const result = await ordersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
        if (result.matchedCount === 0)
          return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ message: "Order status updated successfully" });
      } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/orders/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await ordersCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0)
          return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ message: "Order deleted successfully" });
      } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    });

    //Review Routes

    app.post("/reviews", async (req, res) => {
      try {
        const review = req.body;

        // Validate required fields
        if (!review.name || !review.email || !review.rating || !review.review) {
          return res.status(400).json({ message: "All fields are required." });
        }

        // Insert into MongoDB
        const result = await reviewsCollection.insertOne(review);
        res.status(201).json({
          message: "Review added successfully",
          reviewId: result.insertedId,
        });
      } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/reviews", async (req, res) => {
      try {
        // Fetch all reviews from the MongoDB collection
        const reviews = await reviewsCollection.find({}).toArray();

        // Return the reviews as a response
        res.status(200).json(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.listen(port, () => console.log(`Server is running on port ${port}`));
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();
