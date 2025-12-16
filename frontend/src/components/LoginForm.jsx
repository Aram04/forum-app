// forum-app/frontend/src/components/LoginForm.jsx
import React, { useState } from 'react';
// We don't need AuthContext here because handleLogin/handleSignup is passed via props

const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; // Your Render URL

/**
 * Component for user login.
 * @param {object} props
 * @param {function} props.onLogin - Callback function passed from App.jsx/AppContent
 */
function LoginForm({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed.');
            }

            const data = await response.json();
            
            // Call the handler function from AppContent, which updates the AuthContext
            onLogin(data.user, data.token);

        } catch (e) {
            console.error("Login Error:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Check if the form is empty, if so, please restore this JSX:
    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="login-username">Username:</label>
            <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
            />
            
            <label htmlFor="login-password">Password:</label>
            <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
            />

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging In...' : 'Log In'}
            </button>
            
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default LoginForm;