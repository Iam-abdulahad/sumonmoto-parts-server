const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware

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

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log("Adding new user:", newUser);
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      console.log("inserted new review", newReview);
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("S umonMoto is Runnig!");
});

app.listen(port, () => {
  console.log(`SumonMoto server is running on port: ${port}`);
});
