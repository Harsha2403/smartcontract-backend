const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure the "uploads" folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});

const upload = multer({ storage });

// ✅ GET all contracts
router.get("/contract", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM contract ORDER BY name DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("🔥 Error fetching contracts:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ POST - Add Contract (with file upload)
router.post("/add", upload.single("employerUploadedFile"), async (req, res) => {
    try {
        const { contractid, name, sector, state, contracttype, employer, contract, engineer, contractAmount, employerApprover, contractApprover, engineerApprover, startdate, enddate } = req.body;
        const employerUploadedFile = req.file ? req.file.filename : null;

        // Validation
        if ( !name || !sector || !state || !contracttype || !employer || !contract || !engineer || !contractAmount || !employerApprover || !contractApprover || !engineerApprover || !startdate || !enddate) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if contract ID already exists
        const existingContract = await pool.query("SELECT * FROM contract WHERE name = $1", [name]);
        if (existingContract.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Contract name already exists" });
        }

        // Insert contract into database
        const query = `
            INSERT INTO contract ( name, sector, state, contracttype, employer, contract, engineer, contractAmount, employerApprover, contractApprover, engineerApprover, startdate, enddate, employerUploadedFile) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
            RETURNING *`;

        const values = [name, sector, state, contracttype, employer, contract, engineer, contractAmount, employerApprover, contractApprover, engineerApprover, startdate, enddate, employerUploadedFile];

        const newContract = await pool.query(query, values);
        res.status(201).json({ success: true, data: newContract.rows[0] });

    } catch (err) {
        console.error("🔥 Server Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Serve uploaded files statically
router.use("/uploads", express.static("uploads"));

module.exports = router;
