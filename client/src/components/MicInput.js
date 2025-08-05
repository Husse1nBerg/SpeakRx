// FIND THIS FUNCTION IN YOUR FILE:
const fetchPatients = async () => {
  try {
    const res = await fetch(`${API_URL}/api/patients`);
    const data = await res.json();
    setPatients(data);
  } catch (error) {
    console.error("❌ Failed to fetch patients:", error);
  }
};

// REPLACE IT WITH THIS NEW VERSION:
const fetchPatients = async () => {
  try {
    const res = await fetch(`${API_URL}/api/patients`);

    // Check for HTTP errors like 404 or 500
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();

    // CRUCIAL FIX: Ensure the data is an array before setting the state
    if (Array.isArray(data)) {
      setPatients(data);
    } else {
      console.error("❌ API did not return an array for patients:", data);
      setPatients([]); // On error, reset to an empty array to prevent crash
    }
  } catch (error) {
    console.error("❌ Failed to fetch patients:", error);
    setPatients([]); // On error, reset to an empty array to prevent crash
  }
};