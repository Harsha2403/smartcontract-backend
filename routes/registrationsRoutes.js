const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ensure DB connection is imported

// Fetch all GST registrations
router.get("/registration", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM registration ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("🔥 Error fetching registrations:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Add a new GST registration
router.post("/add", async (req, res) => {
    try {
        const { gstn, state } = req.body;

        // ✅ Validate required fields
        if (!gstn || !state) {
            return res.status(400).json({ success: false, message: "GSTN and State are required" });
        }

        // ✅ Insert into database
        const query = "INSERT INTO registration (gstn, state) VALUES ($1, $2) RETURNING *;";
        const values = [gstn, state];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;