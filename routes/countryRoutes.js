const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all countries
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM countries ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching countries:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new country
router.post("/add", async (req, res) => {
    try {
        const { country_name, country_currency } = req.body;

        if (!country_name || !country_currency) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Check if country already exists
        const existingCountry = await pool.query(
            "SELECT * FROM countries WHERE country_name = $1",
            [country_name]
        );

        if (existingCountry.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Country already exists" });
        }

        // ✅ Insert new country (without sno, as it's auto-incremented)
        const query = `
            INSERT INTO countries (country_name, country_currency, created_at) 
            VALUES ($1, $2, NOW()) RETURNING *`;

        const values = [country_name, country_currency];

        const newCountry = await pool.query(query, values);

        res.status(201).json({ success: true, data: newCountry.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
