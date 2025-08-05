// This log runs first to confirm the script is starting.
console.log("--- SpeakRx Server is attempting to start ---");

try {
  // All initialization code is now safely inside the try block.
  require("dotenv").config();
  const express = require("express");
  const cors = require("cors");

  // Verify that the first set of modules loaded correctly.
  console.log("Successfully loaded initial modules: dotenv, express, cors.");

  const interpretRoute = require("./routes/Interpret");
  const patientsRoute = require("./routes/patients");

  // Verify that the route files were found and loaded.
  console.log("Successfully loaded route modules.");

  const app = express();
  
  // Configure middleware.
  app.use(cors());
  app.use(express.json());

  console.log("Express app configured with middleware.");

  // Configure routes.
  app.use("/api/interpret", interpretRoute);
  app.use("/api/patients", patientsRoute);

  // Health check route.
  app.get("/", (req, res) => res.send("Backend is running!"));

  const PORT = process.env.PORT || 5000;
  
  // Start the server.
  app.listen(PORT, () => {
    // This is the success message we want to see in the logs.
    console.log(`✅ Server is successfully running on port ${PORT}`);
  });

} catch (error) {
  // If the server crashes for ANY reason during startup, this will catch it.
  console.error("!!!!!!!!!! A CRITICAL ERROR OCCURRED DURING STARTUP !!!!!!!!!!");
  console.error(error);
  process.exit(1); // Exit with an error code to make sure Render knows it failed.
}
