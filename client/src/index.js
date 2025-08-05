import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LoginPage from './LoginPage'; // Import our new component
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// This is a simple, synchronous check. It runs instantly.
const isLoggedIn = localStorage.getItem("auth") === 'true';

root.render(
  <React.StrictMode>
    {/* If the user is logged in, show the App. Otherwise, show the LoginPage. */}
    {isLoggedIn ? <App /> : <LoginPage />}
  </React.StrictMode>
);

reportWebVitals();