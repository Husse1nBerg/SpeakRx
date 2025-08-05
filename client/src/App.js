import React, { useState } from "react";
import MicInput from "./components/MicInput";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import './App.css';

export default function App() {
  const [response, setResponse] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("auth");
    // Reload the page. The app will now detect the user is logged out.
    window.location.reload();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    alert("Diagnosis copied to clipboard.");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("AI Diagnosis & Suggestion:", 10, 10);
    doc.text(response || "No response available", 10, 20);
    doc.save("diagnosis.pdf");
  };

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const highlightConflicts = (text) => {
    const keywords = ["conflict", "interaction", "interfere", "avoid", "warning", "contraindicated"];
    const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

    return text.split("\n").map((line, i) => (
      <p key={i} dangerouslySetInnerHTML={{
        __html: line.replace(regex, match => `<span style="color:red;font-weight:bold">${match}</span>`)
      }} />
    ));
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>SpeakRx</h1>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <MicInput setResponse={setResponse} />

      <div className="mt-5">
        <h4>AI Diagnosis & Suggestion:</h4>
        <div className="border p-3 bg-light" style={{ minHeight: "100px" }}>
          {highlightConflicts(response)}
        </div>

        <div className="mt-3">
          <button className="btn btn-outline-secondary me-2" onClick={copyToClipboard}>
            📋 Copy Diagnosis
          </button>
          <button className="btn btn-outline-secondary me-2" onClick={exportToPDF}>
            🖨 Export to PDF
          </button>
          <button className="btn btn-outline-secondary" onClick={() => speak(response)}>
            🔊 Speak Diagnosis
          </button>
        </div>
      </div>
    </div>
  );
}