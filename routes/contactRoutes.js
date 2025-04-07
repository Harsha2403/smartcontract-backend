const express = require("express");
const router = express.Router();
const pool = require("../db"); // Ensure the DB connection is imported

// Add Contact
router.post("/add", async (req, res) => {
    try {
        const { name, email, mobile } = req.body;

        if (!name || !email || !mobile) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Insert contact into contacts table
        const newContactQuery = `
            INSERT INTO contacts (name, email, mobile) 
            VALUES ($1, $2, $3) RETURNING *;
        `;

        const newContactResult = await pool.query(newContactQuery, [name, email, mobile]);

        res.status(201).json({ success: true, message: "Contact added successfully", newContact: newContactResult.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Fetch All Contacts
router.get("/contacts", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM contacts ORDER BY id DESC");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching contacts:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;