require("dotenv").config();
const express = require("express");
const cors = require("cors");
const interpretRoute = require("./routes/Interpret");
const patientsRoute = require("./routes/patients"); // <-- ADD THIS

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/interpret", interpretRoute);
app.use("/api/patients", patientsRoute); // <-- ADD THIS

app.get("/", (req, res) => res.send("SpeakRx Backend is running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});