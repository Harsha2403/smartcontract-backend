const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all sectors
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT sno, boq_name FROM boq ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching boq:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new sector
router.post("/add", async (req, res) => {
    try {
        const { boq_name } = req.body;

        if (!boq_name) {
            return res.status(400).json({ success: false, message: "Boq is required" });
        }

        // ✅ Check if sector already exists
        const existingBOQ = await pool.query(
            "SELECT sno FROM boq WHERE LOWER(boq_name) = LOWER($1)",
            [boq_name]
        );

        if (existingBOQ.rows.length > 0) {
            return res.status(409).json({ success: false, message: "BOQ already exists" });
        }

        // ✅ Insert new sector (auto-incremented `sno`)
        const query = `
            INSERT INTO boq (boq_name, created_at) 
            VALUES ($1, NOW()) RETURNING sno, boq_name`;

        const values = [boq_name];

        const newBOQ = await pool.query(query, values);

        res.status(201).json({ success: true, data: newBOQ.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
