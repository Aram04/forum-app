import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

/**
 * Component for user login.
 */
function LoginForm() {
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
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed.');
            }

            // ✅ NORMALIZE USER SHAPE
            setUser({
                id: data.user_id,
                username: data.username,
                level: data.level
            });

            setUsername('');
            setPassword('');

        } catch (e) {
            console.error("Login Error:", e);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

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
