const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all sectors
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT sno, constructionplant_name FROM constructionplant ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching constructionplant:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new sector
router.post("/add", async (req, res) => {
    try {
        const { constructionplant_name } = req.body;

        if (!constructionplant_name) {
            return res.status(400).json({ success: false, message: "ConstructionPlant is required" });
        }

        // ✅ Check if sector already exists
        const existingConstructionPlant = await pool.query(
            "SELECT sno FROM constructionplant WHERE LOWER(constructionplant_name) = LOWER($1)",
            [constructionplant_name]
        );

        if (existingConstructionPlant.rows.length > 0) {
            return res.status(409).json({ success: false, message: "ConstructionPlant already exists" });
        }

        // ✅ Insert new sector (auto-incremented `sno`)
        const query = `
            INSERT INTO constructionplant (constructionplant_name, created_at) 
            VALUES ($1, NOW()) RETURNING sno, constructionplant_name`;

        const values = [constructionplant_name];

        const newConstructionPlant = await pool.query(query, values);

        res.status(201).json({ success: true, data: newConstructionPlant.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
