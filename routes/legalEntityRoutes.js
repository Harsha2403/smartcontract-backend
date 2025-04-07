const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ensure the DB connection is imported

// ✅ GET route to fetch all legal entities
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM legal_entities ORDER BY legal_entity_id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("🔥 Error fetching entities:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ POST route to add a new legal entity
router.post("/add", async (req, res) => {
    try {
        const { legalEntityId, name, type, cin, website, pan, tan, udyam_number, ie } = req.body;

        // 🔴 Validate required fields
        if (!legalEntityId || !name || !type || !cin || !website) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Check for existing legal entity (Avoid duplicates)
        const existingEntity = await pool.query(
            "SELECT * FROM legal_entities WHERE legal_entity_id = $1 OR cin = $2",
            [legalEntityId, cin]
        );

        if (existingEntity.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Legal Entity ID or CIN already exists" });
        }

        // ✅ Insert new entity
        const query = `INSERT INTO legal_entities 
            (legal_entity_id, name, type, cin, website, pan, tan, udyam_number, ie) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;

        const values = [legalEntityId, name, type, cin, website, pan || null, tan || null, udyam_number || null, ie || null];

        const newEntity = await pool.query(query, values);

        res.status(201).json({ success: true, data: newEntity.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);

        if (err.code === "23505") {
            return res.status(409).json({ success: false, message: "Duplicate entry detected. Please check your data." });
        }

        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;