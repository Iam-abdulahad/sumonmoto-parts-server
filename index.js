const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sumonmotoparts.14hpqnx.mongodb.net/?retryWrites=true&w=majority&appName=SumonMotoParts`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const productCollection = client.db("SumonMoto").collection("products");
    const usersCollection = client.db("SumonMoto").collection("users");
    const reviewCollection = client.db("SumonMoto").collection("reviews");

    // Create unique indexes for uid and email
    await usersCollection.createIndex({ uid: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Get all products
    app.get("/products", async (req, res) => {
      try {
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
      }
    });

    // Get all users
    app.get("/users", async (req, res) => {
      try {
        const cursor = usersCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
      }
    });

    // Get single user by UID

    app.get("/user/:uid", async (req, res) => {
      const { uid } = req.params; // Extract uid correctly
      console.log("Fetching user by UID:", uid);

      try {
        const user = await usersCollection.findOne({ uid });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Return the complete user object based on the format
        res.status(200).json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error", error });
      }
    });

    // Add or update a user

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log("Adding/updating user:", newUser);

      const { uid, email } = newUser;

      try {
        // Check if the user already exists by uid or email
        const existingUser = await usersCollection.findOne({
          $or: [{ uid: uid }, { email: email }],
        });

        if (existingUser) {
          // Update existing user
          const updateResult = await usersCollection.updateOne(
            { _id: existingUser._id },
            {
              $set: {
                name: newUser.name || existingUser.name,
                photoURL: newUser.photoURL || existingUser.photoURL,
                role: newUser.role || existingUser.role,
                facebookURL: newUser.facebookURL || existingUser.facebookURL,
                phone: newUser.phone || existingUser.phone,
              },
            }
          );

          return res.status(200).json({
            message: "User already exists. Updated successfully.",
            user: existingUser,
          });
        } else {
          // Insert the new user
          const result = await usersCollection.insertOne(newUser);
          return res.status(201).json({
            message: "User created successfully.",
            user: { ...newUser, _id: result.insertedId },
          });
        }
      } catch (error) {
        console.error("Error adding/updating user:", error);
        if (error.code === 11000) {
          // Duplicate key error
          return res.status(409).json({ message: "User already exists." });
        }
        return res.status(500).json({ message: "Internal Server Error." });
      }
    });

    // Add a new review
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      console.log("Inserted new review:", newReview);
      try {
        const result = await reviewCollection.insertOne(newReview);
        res.status(201).json({
          message: "Review added successfully.",
          review: { ...newReview, _id: result.insertedId }, // No need for ops
        });
      } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Error adding review" });
      }
    });

    // Make a user admin
    app.put("/make-admin/:id", async (req, res) => {
      try {
        const userId = req.params.id;

        // Validate ObjectId
        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }

        // Update user role to 'admin'
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role: "admin" } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated to admin" });
      } catch (error) {
        console.error("Error updating user to admin:", error);
        res.status(500).json({ message: "Error updating user", error });
      }
    });

    // Delete a user
    app.delete("/users/:userId", async (req, res) => {
      const userId = req.params.userId;
      try {
        // Validate ObjectId
        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }

        const result = await usersCollection.deleteOne({
          _id: new ObjectId(userId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user" });
      }
    });

    // Ping the database to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Optional: Uncomment the next line if you want to close the connection when the server stops
    // await client.close();
  }
}
run().catch(console.dir);

// Root endpoint
app.get("/", (req, res) => {
  res.send("SumonMoto is Running!");
});

// Start the server
app.listen(port, () => {
  console.log(`SumonMoto server is running on port: ${port}`);
});
