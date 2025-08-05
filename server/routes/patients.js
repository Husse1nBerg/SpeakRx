const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../db");
const fs = require("fs");

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/patients - Fetch all patients
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT id, name FROM patients ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("❌ DB error:", err.message);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// POST /api/patients/upload - Upload a new patient's history
router.post("/upload", upload.single("historyFile"), async (req, res) => {
  const { patientName } = req.body;
  const historyText = req.file.buffer.toString("utf-8");

  if (!patientName || !historyText) {
    return res.status(400).json({ error: "Patient name and file are required." });
  }

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
    console.error("❌ DB transaction error:", err.message);
    res.status(500).json({ error: "Failed to save patient history" });
  } finally {
    client.release();
  }
});

module.exports = router;