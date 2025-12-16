// forum-app/frontend/src/context/AuthContext.jsx

import React, { useState, useEffect, createContext } from 'react';

// 1. Create the Context object
export const AuthContext = createContext({
    user: null,
    setUser: () => {},
    isDarkMode: false,
    setIsDarkMode: () => {},
});

/**
 * Provides user authentication state and theme state to the application.
 */
export const AuthProvider = ({ children }) => {
    // 2. Load user state from localStorage on initial load
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            // Parse JSON data, or return null if not found
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Failed to load user from localStorage:", e);
            return null;
        }
    });

    // 3. Load theme state from localStorage on initial load
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const storedTheme = localStorage.getItem('isDarkMode');
            // Convert stored string ("true" or "false") to boolean
            return storedTheme !== null ? JSON.parse(storedTheme) : true; // Default to dark mode
        } catch (e) {
            console.error("Failed to load theme from localStorage:", e);
            return true;
        }
    });


    // 4. useEffect to save user state to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            // Remove user from storage on logout
            localStorage.removeItem('user');
        }
    }, [user]);

    // 5. useEffect to save theme state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // 6. Define the context value
    const contextValue = {
        user,
        setUser,
        isDarkMode,
        setIsDarkMode,
    };

    // 7. Provide the context value to children components
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};