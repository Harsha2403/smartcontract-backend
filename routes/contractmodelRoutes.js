const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ensure the DB connection is imported

// ✅ GET route to fetch all legal entities
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM contract_models ORDER BY sno ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("🔥 Error fetching contractmodel:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ POST route to add a new legal entity
router.post("/add", async (req, res) => {
    try {
        const { contractmodel_name, clause_no, clause_topic, clause_content } = req.body;

        // 🔴 Validate required fields
        if (!contractmodel_name || !clause_no || !clause_topic || !clause_content) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Check for existing legal entity (Avoid duplicates)
        const existingContractModels = await pool.query(
            "SELECT * FROM contract_models WHERE contractmodel_name = $1 OR clause_no = $2",
            [contractmodel_name, clause_no]
        );

        if (existingContractModels.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Contract Model Name or Clause No already exists" });
        }

        // ✅ Insert new entity
        const query = `INSERT INTO contract_models 
            (contractmodel_name, clause_no, clause_topic, clause_content) 
            VALUES ($1, $2, $3, $4) RETURNING *`;

        const values = [contractmodel_name, clause_no, clause_topic, clause_content];

        const newContractModels = await pool.query(query, values);

        res.status(201).json({ success: true, data: newContractModels.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);

        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Duplicate entry detected. Please check your data." });
        }

        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;