import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default function LoginPage() {
  const handleLogin = () => {
    const input = prompt("Enter doctor password:");
    if (input === "med123") {
      localStorage.setItem("auth", "true");
      // Reload the page. The app will now detect the user is logged in.
      window.location.reload();
    } else {
      alert("Incorrect password.");
    }
  };

  return (
    <div className="container text-center py-5">
      <h2>Doctor Login</h2>
      <button className="btn btn-primary mt-3" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}