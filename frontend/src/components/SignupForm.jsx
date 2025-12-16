// forum-app/frontend/src/components/SignupForm.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; // Your API base URL

/**
 * Component for user registration (Sign Up).
 */
function SignupForm() {
    const { setUser } = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // You could also add a state for email or password confirmation if needed

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Basic client-side validation
        if (username.length < 3 || password.length < 6) {
            setError('Username must be at least 3 characters and Password at least 6.');
            setIsLoading(false);
            return;
        }

        try {
            // 🚨 CRITICAL FIX: Use the signup/register endpoint 
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Crucial for receiving the session cookie back to establish login
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle 400 (missing fields), 409 (username exists), etc.
                throw new Error(data.error || 'Registration failed.');
            }

            // Registration successful (the backend usually logs the user in automatically)
            // ✅ NORMALIZE USER SHAPE
            setUser({
                id: data.user_id, // Ensure your Flask endpoint returns user_id
                username: data.username, // Ensure your Flask endpoint returns username
                level: data.level // Ensure your Flask endpoint returns level
            });

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
        <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="signup-username">Username:</label>
            <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
            />

            <label htmlFor="signup-password">Password:</label>
            <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
            />

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Sign Up'}
            </button>

            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default SignupForm;