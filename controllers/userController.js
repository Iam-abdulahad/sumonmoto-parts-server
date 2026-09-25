const generateToken = require("../utils/generateToken");

function createUserController(usersCollection) {
  return {
    createUser: async (req, res) => {
      const { uid, email, name, photoURL, socialAccount, phone, role } = req.body;
      try {
        const existingUser = await usersCollection.findOne({ $or: [{ email }, { uid }] });
        if (existingUser) {
          const token = generateToken(existingUser);
          return res.status(200).json({ message: "Login successful", token, user: existingUser });
        }
        const newUser = { uid, email, name, photoURL, socialAccount, phone, role };
        await usersCollection.insertOne(newUser);
        const token = generateToken(newUser);
        res.status(201).json({ message: "User registered successfully", token, user: newUser });
      } catch (error) {
        console.error("Error during login/register:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },

    getUsers: async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
      }
    },

    getUser: async (req, res) => {
      const { uid } = req.params;
      try {
        const user = await usersCollection.findOne({ uid });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    },

    updateUser: async (req, res) => {
      const userUid = req.params.uid;
      const { toggleRole, ...updatedData } = req.body;
      try {
        const user = await usersCollection.findOne({ uid: userUid });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (toggleRole) {
          const newRole = user.role === "admin" ? "user" : "admin";
          await usersCollection.updateOne({ uid: userUid }, { $set: { role: newRole } });
          return res.json({ message: "User role toggled successfully", role: newRole });
        }
        const result = await usersCollection.updateOne({ uid: userUid }, { $set: updatedData });
        if (result.modifiedCount === 0) {
          return res.status(400).json({ message: "No changes were made" });
        }
        const updatedUser = await usersCollection.findOne({ uid: userUid });
        res.json({ message: "User information updated successfully", data: updatedUser });
      } catch (error) {
        console.error("Error updating user info:", error);
        res.status(500).json({ message: "Failed to update user info", error });
      }
    },

    deleteUser: async (req, res) => {
      const userUid = req.params.uid;
      try {
        const result = await usersCollection.deleteOne({ uid: userUid });
        if (result.deletedCount === 0) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user", error });
      }
    },
  };
}

module.exports = createUserController;