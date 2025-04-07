const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ Add Address (POST)
router.post("/add", async (req, res) => {
  try {
    const { address, address_line2 = "", city, state, pincode, phone } = req.body;

    if (!address || !city || !state || !pincode || !phone) {
      return res.status(400).json({ success: false, message: "Invalid data format" });
    }

    const query = `INSERT INTO address_contacts (address, address_line2, city, state, pincode, phone) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;

    const values = [address, address_line2, city, state, pincode, phone];
    const result = await pool.query(query, values);

    res.status(201).json({ success: true, message: "Address added", addressId: result.rows[0].id });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ✅ Fetch All Addresses (GET)
router.get("/address_contacts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM address_contacts ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;