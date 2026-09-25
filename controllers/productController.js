const { ObjectId } = require("mongodb");

function createProductController(productCollection) {
  return {
    getProducts: async (req, res) => {
      try {
        const { search, category, brand, compatibility, sort } = req.query;
        let query = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
          ];
        }
        if (category) {
          const categories = category.split(',');
          query.category = { $in: categories.map(c => new RegExp(`^${c}$`, 'i')) };
        }
        if (brand) {
          const brands = brand.split(',');
          query.brand = { $in: brands.map(b => new RegExp(`^${b}$`, 'i')) };
        }
        if (compatibility) {
          const compatibilities = compatibility.split(',');
          query.compatibility = { $in: compatibilities.map(c => new RegExp(c, 'i')) };
        }
        let sortOptions = {};
        if (sort === 'price_asc') sortOptions.price = 1;
        if (sort === 'price_desc') sortOptions.price = -1;
        if (sort === 'newest') sortOptions._id = -1;
        if (sort === 'popular') sortOptions.reviewCount = -1;
        const products = await productCollection.find(query).sort(sortOptions).toArray();
        res.json(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
      }
    },

    getProductForOrder: async (req, res) => {
      const { id } = req.params;
      try {
        const product = await productCollection.findOne({ _id: new ObjectId(id) });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Error fetching product" });
      }
    },

    createProduct: async (req, res) => {
      try {
        const { name, price, available_quantity, minimum_order_quantity, description, image, brand, category, compatibility, discount } = req.body;
        if (!name || !price || !available_quantity || !minimum_order_quantity || !description || !image) {
          return res.status(400).json({ error: "Core fields are required" });
        }
        const newProduct = {
          name, price, available_quantity, minimum_order_quantity, description, image,
          brand: brand || "Generic", category: category || "Uncategorized",
          compatibility: compatibility || ["Universal"], discount: discount || 0,
          rating: 0, reviewCount: 0, createdAt: new Date().toISOString()
        };
        const result = await productCollection.insertOne(newProduct);
        res.status(201).json({ message: "Product created successfully", product: { _id: result.insertedId, ...newProduct } });
      } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    updateProductQuantity: async (req, res) => {
      const { id } = req.params;
      const { quantity, action } = req.body;
      try {
        if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid product ID" });
        if (!["add", "deduct"].includes(action)) return res.status(400).json({ message: "Invalid action. Use 'add' or 'deduct'." });
        if (typeof quantity !== "number" || quantity <= 0) return res.status(400).json({ message: "Quantity must be a positive number." });
        const product = await productCollection.findOne({ _id: new ObjectId(id) });
        if (!product) return res.status(404).json({ message: "Product not found." });
        if (typeof product.available_quantity !== "number") return res.status(500).json({ message: "Invalid available_quantity in database." });
        if (action === "deduct" && product.available_quantity < quantity) {
          return res.status(400).json({ message: `Insufficient stock. Current stock: ${product.available_quantity}` });
        }
        const updateQuery = action === "add" ? { $inc: { available_quantity: quantity } } : { $inc: { available_quantity: -quantity } };
        const updateResult = await productCollection.updateOne({ _id: new ObjectId(id) }, updateQuery);
        if (updateResult.modifiedCount === 1) {
          const updatedProduct = await productCollection.findOne({ _id: new ObjectId(id) });
          return res.json({ message: "Product quantity updated successfully.", productId: id, available_quantity: updatedProduct.available_quantity });
        }
        return res.status(500).json({ message: "Failed to update product quantity." });
      } catch (error) {
        console.error("Error updating product quantity:", error);
        res.status(500).json({ message: "Internal server error." });
      }
    },

    deleteProduct: async (req, res) => {
      const { id } = req.params;
      try {
        const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  };
}

module.exports = createProductController;