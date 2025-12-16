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
            // ✅ FIXED: correct backend route
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // REQUIRED for Flask sessions
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed.');
            }

            // ✅ Normalize user object for AuthContext
            setUser({
                id: data.user_id,
                username: data.username,
                level: data.level
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
