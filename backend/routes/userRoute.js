import express from 'express';
import { User } from '../models/userModel.js'; // adjust path
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res.status(400).json({ message: "user_id and password are required." });
    }

    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password." });
    }
    return res.status(200).json({ type: user.type });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;