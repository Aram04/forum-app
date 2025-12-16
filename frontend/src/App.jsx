// forum-app/frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
// NEW IMPORTS: BrowserRouter for context, Routes/Route for defining paths, Link for navigation
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import PostForm from './components/PostForm';
import VoteController from './components/VoteController';
import PostDetail from './components/PostDetail'; // NEW Component

// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; 

// The component that handles the Main Feed display (now its own function)
const MainFeed = ({ user, posts, loading, error, handleNewPost, updatePostScore }) => (
  <section className="main-feed-section">
    <h2>Main Feed</h2>
    
    {user && <PostForm user={user} onPostCreated={handleNewPost} />}
    
    {loading && <p>Loading Posts...</p>}
    {error && <p style={{ color: 'red' }}>Error fetching posts: {error}</p>}

    {!loading && !error && posts.length > 0 && posts.map(post => (
      <div key={post.id} className="post-card-wrapper"> 
        
        <VoteController 
          postId={post.id} 
          initialScore={post.vote_score || 0} 
          user={user} 
          onScoreUpdate={updatePostScore}
        />
        
        <div className="post-content">
          {/* NEW: Use Link component to navigate to the PostDetail page */}
          <Link to={`/post/${post.id}`} className="post-title-link">
             <h3>{post.title}</h3>
          </Link>
          <p className="post-metadata">Score: {post.vote_score || 0} | Author: {post.author_username || 'Anonymous'}</p>
        </div>

      </div>
    ))}
    {!loading && !error && posts.length === 0 && (
      <p>No posts found. Be the first to post!</p>
    )}
  </section>
);


// The main App component now contains the router context and state
function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // --- AUTH HANDLERS ---
  const handleLogin = (userData, authToken) => {
    setUser(userData);
    alert(`Welcome back, ${userData.username}!`);
  };
    
  const handleSignup = (userData, authToken) => {
    setUser(userData);
    alert(`Account created! Welcome, ${userData.username}!`);
  };

  // --- POST HANDLERS ---
  const handleNewPost = (newPost) => {
    const postWithDefaults = { 
      ...newPost, 
      vote_score: newPost.vote_score || 0,
      author_username: user.username, 
    };
    setPosts(prevPosts => [postWithDefaults, ...prevPosts]);
  };
    
  const updatePostScore = (postId, newScore) => {
    setPosts(prevPosts =>
      prevPosts.map(post => 
        post.id === postId ? { ...post, vote_score: newScore } : post
      )
    );
  };

  // --- FETCH POSTS EFFECT ---
  useEffect(() => {
    fetch(`${API_BASE_URL}/posts`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(e => {
        console.error("Could not fetch posts:", e);
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // The overall App structure, wrapped in the Router
  return (
    <BrowserRouter>
      {/* The Router context is applied here */}
      <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
        
        {/* Header and Sidebar are STATIC (they appear on all routes) */}
        <header className="app-header">
          <h1>
            {/* Link the H1 back to the main feed */}
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Mini-Reddit Forum</Link>
          </h1>
          
          <button 
            onClick={toggleTheme} 
            style={{ 
              padding: '8px 12px', 
              border: '1px solid var(--color-border)', 
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9em'
            }}
          >
            {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
          
          {user ? (
            <p>Logged in as: <strong>{user.username}</strong> (<a href="#" onClick={() => setUser(null)}>Log Out</a>)</p>
          ) : (
            <p>Please log in or sign up.</p>
          )}
        </header>

        <aside className="sidebar">
            <nav className="auth-nav">
                <button 
                    className={view === 'login' ? 'active' : ''} 
                    onClick={() => setView('login')}>
                    Log In
                </button>
                <button 
                    className={view === 'signup' ? 'active' : ''} 
                    onClick={() => setView('signup')}>
                    Sign Up
                </button>
            </nav>
          
            <div className="login-form-container">
                {!user && view === 'login' && <LoginForm onLogin={handleLogin} />}
                {!user && view === 'signup' && <SignupForm onSignup={handleSignup} />}
            </div>
            
            {user && (
              <div className="create-post-prompt">
                <p>Welcome, {user.username}.</p>
                <p>Post a new topic in the main feed!</p>
              </div>
            )}
        </aside>

        {/* ROUTES: This area changes based on the URL */}
        <Routes>
          {/* Route 1: Main Feed (path is '/') */}
          <Route 
            path="/" 
            element={<MainFeed 
              user={user} 
              posts={posts} 
              loading={loading} 
              error={error} 
              handleNewPost={handleNewPost} 
              updatePostScore={updatePostScore} 
            />} 
          />
          
          {/* Route 2: Post Detail Page (path is '/post/123') */}
          <Route 
            path="/post/:postId" 
            element={<PostDetail 
              user={user} 
              updatePostScore={updatePostScore} 
            />} 
          />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;