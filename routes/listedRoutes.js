const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ensure DB connection is imported

// ✅ GET route to fetch all listed entities
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM listed ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("🔥 Error fetching listed entities:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ POST route to add a new listed entity
router.post("/add", async (req, res) => {
    try {
        const { legalcompany, legalstock } = req.body;

        // 🔴 Validate required fields
        if (!legalcompany || !legalstock) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Check for existing entity to prevent duplicates
        const existingEntity = await pool.query(
            "SELECT * FROM listed WHERE legalcompany = $1 AND legalstock = $2",
            [legalcompany, legalstock]
        );

        if (existingEntity.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Listing already exists" });
        }

        // ✅ Insert new listing into the database
        const query = `INSERT INTO listed (legalcompany, legalstock) VALUES ($1, $2) RETURNING *`;
        const values = [legalcompany, legalstock];

        const newEntity = await pool.query(query, values);
        res.status(201).json({ success: true, data: newEntity.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);

        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Duplicate entry detected." });
        }

        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;