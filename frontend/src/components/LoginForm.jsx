// forum-app/frontend/src/components/LoginForm.jsx
import React, { useState } from "react";

// IMPORTANT: Ensure this matches the URL you confirmed works (e.g., https://forum-app-3nb5.onrender.com)
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

// This component receives a function (onLogin) from the parent (App.jsx)
// to update the global user state upon success.
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send the credentials as a JSON body
        body: JSON.stringify({ username, password }),
      });

      // Handle server-side errors (like wrong password or user not found)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed due to server error.");
      }

      // Login Successful!
      const data = await response.json();

      // Pass the user data back up to the App component
      // The backend should return the user object and possibly an auth token
      onLogin(data.user, data.token);

      // Clear the form
      setUsername("");
      setPassword("");
    } catch (e) {
      console.error("Login Error:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      {" "}
      {/* Container style from App.css */}
      <div className="auth-form">
        {" "}
        {/* Form style from App.css */}
        <h2>Log In</h2>
        <form onSubmit={handleSubmit}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default LoginForm;
