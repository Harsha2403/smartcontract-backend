const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all sectors
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT sno, pariyojana_name FROM pariyojana ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching pariyojana:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new sector
router.post("/add", async (req, res) => {
    try {
        const { pariyojana_name } = req.body;

        if (!pariyojana_name) {
            return res.status(400).json({ success: false, message: "Pariyojana Name is required" });
        }

        // ✅ Check if sector already exists
        const existingPariyojana = await pool.query(
            "SELECT sno FROM pariyojana WHERE LOWER(pariyojana_name) = LOWER($1)",
            [pariyojana_name]
        );

        if (existingPariyojana.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Pariyojana already exists" });
        }

        // ✅ Insert new sector (auto-incremented `sno`)
        const query = `
            INSERT INTO pariyojana (pariyojana_name, created_at) 
            VALUES ($1, NOW()) RETURNING sno, pariyojana_name`;

        const values = [pariyojana_name];

        const newPariyojana = await pool.query(query, values);

        res.status(201).json({ success: true, data: newPariyojana.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
