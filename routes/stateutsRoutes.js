const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all countries
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM stateuts ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching stateuts:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new country
router.post("/add", async (req, res) => {
    try {
        const { state_name, state_uts, state_capital } = req.body;

        if (!state_name || !state_uts || !state_capital) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Check if country already exists
        const existingStateuts = await pool.query(
            "SELECT * FROM stateuts WHERE state_name = $1",
            [state_name]
        );

        if (existingStateuts.rows.length > 0) {
            return res.status(409).json({ success: false, message: "State/UTs already exists" });
        }

        // ✅ Insert new country (without sno, as it's auto-incremented)
        const query = `
            INSERT INTO stateuts (state_name, state_uts, state_capital, created_at) 
            VALUES ($1, $2,$3, NOW()) RETURNING *`;

        const values = [state_name, state_uts, state_capital];

        const newStateuts = await pool.query(query, values);

        res.status(201).json({ success: true, data: newStateuts.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
