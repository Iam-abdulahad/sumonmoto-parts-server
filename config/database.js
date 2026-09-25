const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@sumonmotoparts.14hpqnx.mongodb.net/?retryWrites=true&w=majority&appName=SumonMotoParts`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDatabase() {
  await client.connect();
  const db = client.db("SumonMoto");

  return {
    productCollection: db.collection("products"),
    usersCollection: db.collection("users"),
    ordersCollection: db.collection("orders"),
    reviewsCollection: db.collection("reviews"),
  };
}

module.exports = { connectDatabase };