# SpeakRx AI: Technical Overview

### Introduction

SpeakRx is a full-stack proof-of-concept application demonstrating an advanced, AI-powered clinical assistant. This document details the technologies used and the system's architecture, focusing on how the client, server, and specialized AI modules work together.


## Core Technology Stack

The application is built on a robust and modern stack, with clear separation of concerns between the frontend, backend, and database.

### Client (Frontend)

* **Technology:** **React**

* **Role:** The client is responsible for everything the user sees and interacts with. It was built using Create React App and styled with Bootstrap.

* **Handles:**

    * Rendering the user interface (buttons, text areas, dropdowns).
    * Capturing user input, including text from the doctor's notes and selections from dropdowns.
    * Using the browser's Web Speech API for real-time speech-to-text transcription.
    * Managing UI state, such as which patient is selected or if the AI is currently processing a request.
    * Making API calls to the backend server to send consultation data and receive the final AI-generated diagnosis.

### Server (Backend)

* **Technology:** **Node.js** with the **Express.js** framework.

* **Role:** The server acts as the central hub and the brain of the application. It processes requests from the client, orchestrates the AI logic, and communicates with the database.

* **Handles:**

    * Providing a secure API endpoint for the client.
    * Receiving consultation data (transcript, notes, patient ID).
    * Managing patient data, including handling file uploads for new medical histories and storing them in the database.
    * Executing the core AI agent logic.
    * Connecting to and querying the PostgreSQL database.

### Database

* **Technology:** **PostgreSQL**

* **Role:** Acts as the persistent memory for the application.

* **Handles:**

    * Storing patient information (e.g., name, ID).
    * Storing unstructured text data, specifically the complete medical history for each patient, which is crucial for the RAG process.

---

## Specialized AI Architecture

The "magic" of this application comes from two distinct but related AI concepts that work in tandem.

### Retrieval-Augmented Generation (RAG)

* **What it is:** RAG is a technique used to make AI models more knowledgeable and context-aware. Instead of relying solely on its pre-trained data, the model first **retrieves** relevant, up-to-date information from an external source and uses that to **augment** its prompt.

* **Its Role in SpeakRx:** In this application, RAG is used to give the AI crucial context about the specific patient being discussed. When a doctor selects a patient, the system performs an active RAG workflow:

    1.  **Retrieval:** The backend queries the **PostgreSQL** database to fetch the complete medical history text for the selected patient.
    2.  **Augmentation:** This retrieved history is then dynamically injected into the prompt that is sent to the GPT-4 model.
    3.  **Generation:** The AI generates its diagnosis *with full knowledge* of the patient's past conditions, allergies, and medications, leading to a much safer and more personalized analysis.

### Model-Context-Protocol (MCP) / The AI Agent

* **What it is:** The MCP is the high-level architecture that acts as the application's central "reasoning engine." It's implemented as an **AI Agent** using the **LangChain.js** framework. This agent can think, reason, and autonomously decide to use a set of predefined "tools" to accomplish its goal.

* **Its Role in SpeakRx:** The agent orchestrates the entire analysis process. It is powered by **GPT-4 Turbo**.
    1.  **Orchestration:** After receiving a request, the Agent—not just a simple API call—takes control.
    2.  **Tool Use:** The Agent's first decision is to use its `patientHistoryTool` (our RAG implementation). After analyzing the retrieved history, it may decide a safety check is needed and autonomously use its `drugInteractionTool`, which calls an external FDA API.
    3.  **Synthesis:** After using all necessary tools to gather complete context, the Agent synthesizes all the information—the doctor's notes, the retrieved history, and the results of the drug check—to form its final, coherent, and safety-checked recommendation.