// --- Start of new error handling code ---
console.log("--- SpeakRx Server is attempting to start ---");

try {
  // --- Original code is now inside this try block ---

  require("dotenv").config();
  const express = require("express");
  const cors = require("cors");
  
  // Verify that all required modules were loaded
  console.log("Successfully loaded initial modules: dotenv, express, cors.");

  const interpretRoute = require("./routes/Interpret");
  const patientsRoute = require("./routes/patients");
  
  console.log("Successfully loaded route modules.");

  const app = express();
  app.use(cors());
  app.use(express.json());

  console.log("Express app configured.");

  app.use("/api/interpret", interpretRoute);
  app.use("/api/patients", patientsRoute);

  // Health check
  app.get("/", (req, res) => res.send("Backend is running!"));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    // This is the success message we want to see
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });

// --- Start of new error handling code ---
} catch (error) {
  // If the server crashes for ANY reason during startup, this will catch it
  console.error("!!!!!!!!!! A CRITICAL ERROR OCCURRED DURING STARTUP !!!!!!!!!!");
  console.error(error);
  process.exit(1); // Exit with an error code to make sure Render knows it failed
}