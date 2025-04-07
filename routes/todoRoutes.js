const express = require("express");
const db = require("../db");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* ✅ Middleware to Verify JWT */
const authenticateUser = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || "your_secret_key", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = decoded;
    next();
  });
};

/* ✅ Add To-Do Item */
router.post("/add", authenticateUser, (req, res) => {
  const { task } = req.body;
  const userId = req.user.userId;

  if (!task) return res.status(400).json({ message: "Task is required" });

  const sql = "INSERT INTO todos (user_id, task) VALUES (?, ?)";
  db.query(sql, [userId, task], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.status(201).json({ message: "Task added", id: result.insertId });
  });
});

/* ✅ Get All To-Do Items */
router.get("/list", authenticateUser, (req, res) => {
  const userId = req.user.userId;
  const sql = "SELECT * FROM todos WHERE user_id = ?";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

/* ✅ Update To-Do Status */
router.put("/update/:id", authenticateUser, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;

  if (!["pending", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const sql = "UPDATE todos SET status = ? WHERE id = ? AND user_id = ?";
  db.query(sql, [status, id, userId], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Task updated" });
  });
});

/* ✅ Delete To-Do Item */
router.delete("/delete/:id", authenticateUser, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const sql = "DELETE FROM todos WHERE id = ? AND user_id = ?";
  db.query(sql, [id, userId], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Task deleted" });
  });
});

module.exports = router;