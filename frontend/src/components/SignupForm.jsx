// forum-app/frontend/src/components/SignupForm.jsx
import React, { useState } from 'react';

const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; 

function SignupForm({ onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed.');
      }

      // Signup Successful! Log the user in directly (optional, but convenient)
      const data = await response.json();
      
      onSignup(data.user, data.token); 
      
      setUsername('');
      setPassword('');

    } catch (e) {
      console.error("Signup Error:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form"> {/* Use a class for styling! */}
      <h3>Sign Up</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default SignupForm;