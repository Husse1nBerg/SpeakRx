import React, { useState, useEffect } from "react";

// This line makes the component work in both development and production.
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function MicInput({ setResponse }) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [language, setLanguage] = useState("en");
  const [conditions, setConditions] = useState({
    diabetes: false, hypertension: false, asthma: false, cancer: false, heart: false,
  });

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [historyFile, setHistoryFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // A single, robust function to fetch patients
  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patients`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        console.error("❌ API did not return an array for patients:", data);
        setPatients([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch patients:", error);
      setPatients([]);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleFileUpload = async () => {
    if (!historyFile || !newPatientName) {
      alert("Please provide a patient name and select a .txt file.");
      return;
    }
    const formData = new FormData();
    formData.append("patientName", newPatientName);
    formData.append("historyFile", historyFile);

    try {
      const res = await fetch(`${API_URL}/api/patients/upload`, { method: "POST", body: formData });
      if (res.ok) {
        alert("Patient history uploaded successfully!");
        setNewPatientName("");
        setHistoryFile(null);
        document.getElementById('history-file-input').value = null;
        fetchPatients();
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error}`);
      }
    } catch (error) {
      console.error("❌ File upload error:", error);
      alert("An error occurred during file upload.");
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = language === "en" ? "en-US" : language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : language === "ar" ? "ar-EG" : "en-US";
    recog.interimResults = false;
    recog.onstart = () => setIsListening(true);
    recog.onend = () => setIsListening(false);
    recog.onerror = () => setIsListening(false);
    recog.onresult = (event) => setTranscript(event.results[0][0].transcript);
    recog.start();
  };

  const getConditionText = () => {
    const selected = Object.entries(conditions).filter(([_, value]) => value).map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
    return selected.length > 0 ? selected.join(", ") : "None noted";
  };

  const diagnose = async () => {
    if (!transcript && !doctorNotes) {
      alert("Please enter patient symptoms or doctor notes.");
      return;
    }
    setIsLoading(true);
    setResponse("");
    
    const promptData = {
      language,
      conditions: getConditionText(),
      transcript,
      doctorNotes
    };

    try {
      const res = await fetch(`${API_URL}/api/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptData, patientId: selectedPatient }),
      });

      const data = await res.json();
      setResponse(data.advice || "No response from AI.");
    } catch (error) {
      console.error("❌ AI error:", error);
      setResponse("Failed to get a response from AI.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleConditionChange = (e) => {
    const { name, checked } = e.target;
    setConditions(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div>
      <div className="card bg-light p-3 mb-4 border-primary">
        <h5 className="card-title">Patient Context</h5>
        <div className="row g-3 align-items-end">
            <div className="col-md-6">
                <label htmlFor="patient-select" className="form-label"><strong>1. Select Existing Patient</strong></label>
                <select id="patient-select" className="form-select" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                    <option value="">None / New Consultation</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="col-md-6">
                <label className="form-label"><strong>2. Or Upload New History (.txt)</strong></label>
                <div className="input-group">
                    <input type="text" className="form-control" placeholder="New Patient Name" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} />
                    <input id="history-file-input" type="file" className="form-control" accept=".txt" onChange={e => setHistoryFile(e.target.files[0])}/>
                    <button className="btn btn-outline-primary" type="button" onClick={handleFileUpload}>Upload</button>
                </div>
            </div>
        </div>
      </div>
      
      <label htmlFor="language-select" className="form-label"><strong>Language:</strong></label>
      <select id="language-select" className="form-select mb-3" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option> <option value="fr">Français</option> <option value="es">Español</option> <option value="ar">العربية</option>
      </select>
      
      <button className="btn btn-dark w-100 p-3 mb-3 fs-5" onClick={startListening} disabled={isLoading}>
        ��� {isListening ? "Listening..." : "Start Talking"}
      </button>

      <div className="mb-3">
        <label htmlFor="patient-claims" className="form-label"><strong>Patient claims:</strong></label>
        <div id="patient-claims" className="form-control" style={{ minHeight: "50px" }}>{transcript}</div>
      </div>

      <div className="mb-3">
        <label htmlFor="doctor-notes" className="form-label"><strong>Doctor recommendation:</strong></label>
        <textarea id="doctor-notes" className="form-control" rows="4" value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)} placeholder="E.g. Patient is diabetic. Avoid NSAIDs. Previously on amoxicillin..."/>
      </div>

      <div className="mb-3">
        <label className="form-label"><strong>Pre-existing Conditions:</strong></label>
        {Object.keys(conditions).map((key) => (
            <div className="form-check form-check-inline" key={key}>
                <input className="form-check-input" type="checkbox" name={key} checked={conditions[key]} onChange={handleConditionChange} id={key} />
                <label className="form-check-label" htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
            </div>
        ))}
      </div>

      <button className="btn btn-success w-100 py-3 fs-5" onClick={diagnose} disabled={isLoading}>
        {isLoading ? ' Diagnosing...' : 'Diagnose'}
      </button>
    </div>
  );
}
