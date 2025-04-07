const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ensure DB connection is imported

// Fetch all bank details
router.get("/bankdetails", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM bankdetails ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("🔥 Error fetching bank details:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Add a new bank detail
router.post("/add", async (req, res) => {
    try {
        const { accountnumber, accounttype, bankname, branch, ifsc, swift } = req.body;

        // ✅ Validate required fields
        if (!accountnumber || !accounttype || !bankname || !branch || !ifsc || !swift) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Insert into database
        const query = `
            INSERT INTO bankdetails (accountnumber, accounttype, bankname, branch, ifsc, swift) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const values = [accountnumber, accounttype, bankname, branch, ifsc, swift];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;