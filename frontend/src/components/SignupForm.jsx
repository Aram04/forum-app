// forum-app/frontend/src/components/SignupForm.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Render backend URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

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

        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // REQUIRED for Flask sessions
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Signup failed. Username may be taken.');
            }

            const data = await response.json();

            // Backend returns user info; store it in AuthContext
            setUser(data.user);

            // Clear form
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
            <h3>Sign Up</h3>

            <input
                type="text"
                placeholder="New Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
            />

            <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
            />

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>

            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default SignupForm;
