const express = require("express");
const router = express.Router();
const db = require("../db");

// LangChain Imports - axios is no longer needed
const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { DynamicTool } = require("langchain/tools");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

// Initialize the Powerful LLM
const model = new ChatOpenAI({ 
    temperature: 0, 
    modelName: "gpt-4-turbo" 
});

// --- TOOL DEFINITION (Only one tool is needed now) ---

const patientHistoryTool = new DynamicTool({
  name: "get_patient_history",
  description: "Fetches the complete medical history for a patient given their patient_id. This is the primary tool for gathering context about past conditions, allergies, and, most importantly, their current medication list.",
  func: async (patientId) => {
    try {
      const { rows } = await db.query("SELECT history_text FROM medical_histories WHERE patient_id = $1", [patientId]);
      if (rows.length === 0) return "No history found for this patient ID.";
      return `Patient History Retrieved: ${rows[0].history_text}`;
    } catch (e) {
      return `Error: Could not fetch patient history from the database. ${e.message}`;
    }
  },
});


// --- THE AGENT ROUTE (with new instructions) ---

router.post("/", async (req, res) => {
  const { promptData, patientId } = req.body;
  const tools = [patientHistoryTool]; // The agent's toolbox is now simpler

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "openai-functions",
    verbose: true, 
  });

  // --- REWRITTEN PROMPT WITH NEW LOGIC AND FORMATTING ---
  const input = `
    You are SpeakRx, an AI medical analysis engine. Your task is to generate a professional, concise clinical assessment.

    **Consultation Data:**
    - Language for Response: ${promptData.language.toUpperCase()}
    - Selected Patient ID: ${patientId || "None"}
    - Patient's Spoken Claims: "${promptData.transcript}"
    - Doctor's Written Notes: "${promptData.doctorNotes}"
    - Manually Checked Pre-existing Conditions: "${promptData.conditions}"

    **Your Strict Protocol:**
    1.  If a 'Patient ID' is provided, your ONLY first step is to use the 'get_patient_history' tool to retrieve their full medical history. This is mandatory for context.
    2.  Based on all available information (claims, notes, and retrieved history), determine a potential diagnosis and suggest a primary medication.
    3.  After suggesting a medication, perform an INTERNAL analysis. Scour the retrieved medical history to identify the patient's CURRENT medications. Cross-reference these with the new medication you suggested and identify any significant potential interactions based on your trained knowledge.
    4.  Generate a final report.

    **Output Formatting Rules (MANDATORY):**
    - Do NOT use letter format. No "Dear Doctor," "Best regards," or any salutations.
    - Do NOT use markdown bolding (**).
    - Use concise, professional, and informative sentences.
    - The output MUST be structured with the following headers, exactly as written:
        ### Patient Assessment: [Patient Name if available, otherwise leave blank]
        
        Potential Diagnosis
        
        Medication Suggestion
        
        Interaction Analysis
        
        Recommended Actions
  `;
  
  try {
    const result = await executor.run(input);
    res.json({ advice: result });
  } catch (err) {
    console.error("❌ Agent error:", err);
    res.status(500).json({ error: "The AI Agent failed to complete its task." });
  }
});

module.exports = router;