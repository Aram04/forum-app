// forum-app/frontend/src/main.jsx (or index.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // <-- Global styles
import './App.css';  // <-- Component styles (make sure this is here!)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)