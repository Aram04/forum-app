// forum-app/frontend/src/components/SignupForm.jsx

import React, { useState, useContext } from 'react'; // Add useContext
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "https://https://forum-app-3nb5.onrender.com"; 

// 1. Remove the redundant onSignup prop, as we will use context
function SignupForm({ onSignup }) {
    
    const { setUser } = useContext(AuthContext); // 2. Get the setUser function from context

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Specific error handling for signup (e.g., user already exists)
                throw new Error(errorData.error || 'Signup failed. Username may be taken.');
            }

            const userData = await response.json();
            
            // 3. Instead of calling the prop `onSignup`, call the function 
            // defined in AppContent (which calls setUser)
            onSignup(userData, userData.token); 
            
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