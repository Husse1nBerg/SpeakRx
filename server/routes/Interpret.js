const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { symptoms } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `A patient says: "${symptoms}". What could be the cause, and what treatment do you suggest?`,
        },
      ],
    });

    // saev session data
const fs = require("fs");
const path = require("path");

function saveSession(data) {
  const logPath = path.join(__dirname, "../logs/sessions.json");
  const sessions = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath)) : [];
  sessions.push({ ...data, timestamp: new Date().toISOString() });
  fs.writeFileSync(logPath, JSON.stringify(sessions, null, 2));
}




    res.json({ advice: completion.choices[0].message.content });
  } catch (err) {
    console.error("❌ AI error:", err.message);
    res.status(500).json({ error: "AI failed to respond" });
  }
  
  saveSession({ transcript, doctorNotes, advice });

});

module.exports = router;
// This code defines an Express route for interpreting symptoms using OpenAI's GPT-3.5-turbo model.
// It listens for POST requests at the "/api/interpret" endpoint, extracts symptoms from the request body,