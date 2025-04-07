const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all sectors
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT sno, supplyitems_name FROM supplyitems ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching supplyitems:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new sector
router.post("/add", async (req, res) => {
    try {
        const { supplyitems_name } = req.body;

        if (!supplyitems_name) {
            return res.status(400).json({ success: false, message: "Construction Material is required" });
        }

        // ✅ Check if sector already exists
        const existingSupplyItems = await pool.query(
            "SELECT sno FROM supplyitems WHERE LOWER(supplyitems_name) = LOWER($1)",
            [supplyitems_name]
        );

        if (existingSupplyItems.rows.length > 0) {
            return res.status(409).json({ success: false, message: "ConstructionMaterial already exists" });
        }

        // ✅ Insert new sector (auto-incremented `sno`)
        const query = `
            INSERT INTO supplyitems (supplyitems_name, created_at) 
            VALUES ($1, NOW()) RETURNING sno, supplyitems_name`;

        const values = [supplyitems_name];

        const newSupplyItems = await pool.query(query, values);

        res.status(201).json({ success: true, data: newSupplyItems.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
