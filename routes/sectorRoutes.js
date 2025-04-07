const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all sectors
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT sno, sector_name FROM sectors ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching sectors:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new sector
router.post("/add", async (req, res) => {
    try {
        const { sector_name } = req.body;

        if (!sector_name) {
            return res.status(400).json({ success: false, message: "Sector Name is required" });
        }

        // ✅ Check if sector already exists
        const existingSector = await pool.query(
            "SELECT sno FROM sectors WHERE LOWER(sector_name) = LOWER($1)",
            [sector_name]
        );

        if (existingSector.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Sector already exists" });
        }

        // ✅ Insert new sector (auto-incremented `sno`)
        const query = `
            INSERT INTO sectors (sector_name, created_at) 
            VALUES ($1, NOW()) RETURNING sno, sector_name`;

        const values = [sector_name];

        const newSector = await pool.query(query, values);

        res.status(201).json({ success: true, data: newSector.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
