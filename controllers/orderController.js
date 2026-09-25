const { ObjectId } = require("mongodb");

function createOrderController(ordersCollection) {
  return {
    getOrders: async (req, res) => {
      try {
        const orders = await ordersCollection.find().toArray();
        res.json(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders" });
      }
    },
    createOrder: async (req, res) => {
      try {
        const { orderId, productName, price, totalPrice, quantity, customerName, customerEmail, shippingInfo, contactInfo, status } = req.body;
        if (!orderId || !productName || !price || !totalPrice || !quantity || !customerName || !customerEmail || !shippingInfo || !contactInfo || !status) {
          return res.status(400).json({ error: "All fields are required" });
        }
        const newOrder = { orderId, productName, price, totalPrice, quantity, customerName, customerEmail, shippingInfo, contactInfo, orderTime: new Date().toISOString(), status };
        const result = await ordersCollection.insertOne(newOrder);
        res.status(201).json({ message: "Order placed successfully", order: { _id: result.insertedId, ...newOrder } });
      } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
    updateOrder: async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid order ID" });
      try {
        const result = await ordersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
        if (result.matchedCount === 0) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ message: "Order status updated successfully" });
      } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
    deleteOrder: async (req, res) => {
      const { id } = req.params;
      try {
        const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ message: "Order deleted successfully" });
      } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  };
}

module.exports = createOrderController;