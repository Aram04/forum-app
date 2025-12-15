// forum-app/frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import PostForm from './components/PostForm'; // Assumes you created this
import VoteController from './components/VoteController'; // Placeholder for the next step

// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; 

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' or 'signup'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- AUTH HANDLERS ---
  const handleLogin = (userData, authToken) => {
    // In a real app, save the authToken here!
    setUser(userData);
    alert(`Welcome back, ${userData.username}!`);
  };
    
  const handleSignup = (userData, authToken) => {
    setUser(userData);
    alert(`Account created! Welcome, ${userData.username}!`);
  };

  // --- POST HANDLERS ---
  // Function to add a new post to the state and put it at the top
  const handleNewPost = (newPost) => {
    // Ensure new post includes necessary defaults if backend is minimal
    const postWithDefaults = { 
      ...newPost, 
      vote_score: newPost.vote_score || 0,
      author_username: user.username, 
    };
    setPosts(prevPosts => [postWithDefaults, ...prevPosts]);
  };
    
  // Function to update the score of a post without re-fetching all posts
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

  // --- RENDERING LOGIC ---
  return (
    <div className="app-container">
      
      {/* Header spans the top of the grid */}
      <header className="app-header">
        <h1>Mini-Reddit Forum</h1>
        {user ? (
          <p>Logged in as: <strong>{user.username}</strong> (<a href="#" onClick={() => setUser(null)}>Log Out</a>)</p>
        ) : (
          <p>Please log in or sign up.</p>
        )}
      </header>

      {/* SIDEBAR: Direct child of app-container (Column 1) */}
      <aside className="sidebar">
          {/* Login/Signup Toggle Links */}
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

      {/* MAIN FEED: Direct child of app-container (Column 2) */}
      <section className="main-feed-section">
          <h2>Main Feed</h2>
          
          {/* Post Form appears for logged-in users */}
          {user && <PostForm user={user} onPostCreated={handleNewPost} />}
          
          {loading && <p>Loading Posts...</p>}
          {error && <p style={{ color: 'red' }}>Error fetching posts: {error}</p>}

          {/* Display posts */}
          {!loading && !error && posts.length > 0 && posts.map(post => (
            <div key={post.id} className="post-card-wrapper"> 
              
              {/* VOTE CONTROLLER (pass the update function) */}
              <VoteController 
                postId={post.id} 
                initialScore={post.vote_score || 0} 
                user={user} 
                onScoreUpdate={updatePostScore}
              />
              
              {/* POST CONTENT */}
              <div className="post-content">
                <h3>{post.title}</h3>
                <p className="post-metadata">Score: {post.vote_score || 0} | Author: {post.author_username || 'Anonymous'}</p>
              </div>

            </div>
          ))}
          {!loading && !error && posts.length === 0 && (
            <p>No posts found. Be the first to post!</p>
          )}
      </section>

    </div>
  );
}

export default App;