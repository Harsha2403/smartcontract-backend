const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection

// ✅ Get all sectors
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT sno, contracttopic_name FROM contracttopic ORDER BY sno ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("🔥 Error fetching contracttopic:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Add a new sector
router.post("/add", async (req, res) => {
    try {
        const { contracttopic_name } = req.body;

        if (!contracttopic_name) {
            return res.status(400).json({ success: false, message: "ContractTopic Name is required" });
        }

        // ✅ Check if sector already exists
        const existingContracttopic = await pool.query(
            "SELECT sno FROM contracttopic WHERE LOWER(contracttopic_name) = LOWER($1)",
            [contracttopic_name]
        );

        if (existingContracttopic.rows.length > 0) {
            return res.status(409).json({ success: false, message: "ContarctTopic already exists" });
        }

        // ✅ Insert new sector (auto-incremented `sno`)
        const query = `
            INSERT INTO contracttopic (contracttopic_name, created_at) 
            VALUES ($1, NOW()) RETURNING sno, contracttopic_name`;

        const values = [contracttopic_name];

        const newContracttopic = await pool.query(query, values);

        res.status(201).json({ success: true, data: newContracttopic.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
