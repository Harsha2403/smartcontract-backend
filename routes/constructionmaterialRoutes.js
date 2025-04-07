const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all sectors
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT sno, constructionmaterial_name FROM constructionmaterial ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching constructionmaterial:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new sector
router.post("/add", async (req, res) => {
    try {
        const { constructionmaterial_name } = req.body;

        if (!constructionmaterial_name) {
            return res.status(400).json({ success: false, message: "Construction Material is required" });
        }

        // ✅ Check if sector already exists
        const existingConstructionMaterial = await pool.query(
            "SELECT sno FROM constructionmaterial WHERE LOWER(constructionmaterial_name) = LOWER($1)",
            [constructionmaterial_name]
        );

        if (existingConstructionMaterial.rows.length > 0) {
            return res.status(409).json({ success: false, message: "ConstructionMaterial already exists" });
        }

        // ✅ Insert new sector (auto-incremented `sno`)
        const query = `
            INSERT INTO constructionmaterial (constructionmaterial_name, created_at) 
            VALUES ($1, NOW()) RETURNING sno, constructionmaterial_name`;

        const values = [constructionmaterial_name];

        const newConstructionMaterial = await pool.query(query, values);

        res.status(201).json({ success: true, data: newConstructionMaterial.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
