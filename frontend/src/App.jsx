// forum-app/frontend/src/App.jsx

import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import PostForm from './components/PostForm';
import VoteController from './components/VoteController';
import PostDetail from './components/PostDetail';
import { AuthProvider, AuthContext } from './context/AuthContext';

// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

// --- MainFeed Component (Uses Context) ---
const MainFeed = ({ posts, loading, error, handleNewPost, updatePostScore }) => {
  const { user } = useContext(AuthContext);

  return (
    <section className="main-feed-section">
      <h2>Main Feed</h2>

      {/* PostForm visibility controlled by user context */}
      {user && <PostForm onPostCreated={handleNewPost} />}

      {loading && <p>Loading Posts...</p>}
      {error && <p style={{ color: 'red' }}>Error fetching posts: {error}</p>}

      {!loading && !error && posts.map(post => (
        <div key={post.id} className="post-card-wrapper">
          <VoteController
            postId={post.id}
            initialScore={post.vote_score || 0}
            onScoreUpdate={updatePostScore}
          />

          <div className="post-content">
            <Link to={`/post/${post.id}`} className="post-title-link">
              <h3>{post.title}</h3>
            </Link>
            <p className="post-metadata">
              Score: {post.vote_score || 0} | Author: {post.author_username || "Anonymous"}
            </p>
          </div>
        </div>
      ))}

      {!loading && !error && posts.length === 0 && (
        <p>No posts found. Be the first to post!</p>
      )}
    </section>
  );
};

function App() {
  const [view, setView] = useState('login');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const updatePostScore = (postId, newScore) => {
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, vote_score: newScore } : p)
    );
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/posts`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const AppContent = () => {
    const { user, setUser } = useContext(AuthContext);

    return (
      <div className={`app-container ${!isSidebarVisible ? 'sidebar-hidden' : ''}`}>
        <header className="app-header">
          <div className="header-left">
            <button
              onClick={() => setIsSidebarVisible(v => !v)}
              className="sidebar-toggle-btn"
            >
              {isSidebarVisible ? '✖' : '☰'}
            </button>

            <h1>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                Mini-Reddit Forum
              </Link>
            </h1>
          </div>

          <div className="header-right">
            {user ? (
              <>
                <p>Logged in as <strong>{user.username}</strong></p>
                <button onClick={() => setUser(null)}>Log Out</button>
              </>
            ) : (
              <p>Please log in or sign up.</p>
            )}
          </div>
        </header>

        {isSidebarVisible && (
          <aside className="sidebar">
            {!user ? (
              <>
                <nav className="auth-nav">
                  <button onClick={() => setView('login')}>Log In</button>
                  <button onClick={() => setView('signup')}>Sign Up</button>
                </nav>

                {view === 'login' && <LoginForm />}
                {view === 'signup' && <SignupForm />}
              </>
            ) : (
              <nav className="user-nav-links">
                <h3>Welcome, {user.username}</h3>
                <ul>
                  <li><Link to="/">🏠 Home</Link></li>
                  <li><Link to="/popular">🔥 Popular</Link></li>
                  <li><Link to="/profile">👤 My Profile</Link></li>
                </ul>
              </nav>
            )}
          </aside>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <MainFeed
                posts={posts}
                loading={loading}
                error={error}
                handleNewPost={handleNewPost}
                updatePostScore={updatePostScore}
              />
            }
          />

          <Route
            path="/post/:postId"
            element={<PostDetail updatePostScore={updatePostScore} />}
          />

          <Route path="/popular" element={<h2>Popular Posts (Placeholder)</h2>} />
          <Route path="/profile" element={<h2>My Profile (Placeholder)</h2>} />
        </Routes>
      </div>
    );
  };

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
