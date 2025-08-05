const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../db");

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/patients - Fetch all patients for the dropdown
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT id, name FROM patients ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("DB error fetching patients:", err.message);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// POST /api/patients/upload - Upload a new patient's history
router.post("/upload", upload.single("historyFile"), async (req, res) => {
  // First, validate that the file and name exist
  if (!req.file || !req.body.patientName) {
    return res.status(400).json({ error: "Patient name and file are required." });
  }

  // If they exist, proceed
  const { patientName } = req.body;
  const historyText = req.file.buffer.toString("utf-8");

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    const patientRes = await client.query(
      "INSERT INTO patients (name) VALUES ($1) RETURNING id",
      [patientName]
    );
    const newPatientId = patientRes.rows[0].id;

    await client.query(
      "INSERT INTO medical_histories (patient_id, history_text) VALUES ($1, $2)",
      [newPatientId, historyText]
    );

    await client.query("COMMIT");
    res.status(201).json({ success: true, patientId: newPatientId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DB transaction error:", err.message);
    res.status(500).json({ error: "Failed to save patient history" });
  } finally {
    client.release();
  }
});

module.exports = router;
