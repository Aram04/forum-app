// forum-app/frontend/src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';

// 1. Create the Context object
export const AuthContext = createContext({
  user: null, // The user object (null if logged out)
  setUser: () => {}, // Function to update the user object
  isLoggedIn: false, // Simple boolean for login status
  isDarkMode: false,
  setIsDarkMode: () => {},
});

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  // Use state management for user and dark mode
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // The login status is derived from the user object
  const isLoggedIn = !!user; 

  const contextValue = {
    user,
    setUser,
    isLoggedIn,
    isDarkMode,
    setIsDarkMode,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};