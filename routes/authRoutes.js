const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // ✅ Ensure correct import

const router = express.Router();

/* ============================
 ✅ User Registration
=============================== */
router.post("/register", async (req, res) => {
  const { username, email, phone, password } = req.body;

  if (!username || !email || !phone || !password) {
    return res.status(400).json({ message: "⚠️ All fields are required" });
  }

  try {
    // ✅ Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "❌ Username or email already exists" });
    }

    // ✅ Securely Hash Password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Insert New User into Database
    const newUser = await pool.query(
      "INSERT INTO users (username, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email",
      [username, email, phone, hashedPassword]
    );

    console.log("✅ User Registered:", newUser.rows[0]);
    res.status(201).json({
      message: "✅ User registered successfully",
      user: newUser.rows[0], // Optional: Send registered user details
    });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "❌ Internal server error" });
  }
});

/* ============================
 ✅ User Login
=============================== */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "⚠️ Username and password required" });
  }

  try {
    // ✅ Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "❌ Invalid Username  " });
    }

    const user = result.rows[0];

    // ✅ Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "❌ Invalid Password" });
    }

    // ✅ Ensure JWT Secret is Set
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment variables!");
      return res.status(500).json({ message: "❌ Server misconfiguration" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "✅ Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "❌ Internal server error" });
  }
});

module.exports = router;