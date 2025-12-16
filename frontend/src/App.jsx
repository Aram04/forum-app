// forum-app/frontend/src/App.jsx

import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import PostForm from './components/PostForm';
import VoteController from './components/VoteController';
import PostDetail from './components/PostDetail';
import Profile from "./components/Profile";
import { AuthProvider, AuthContext } from './context/AuthContext';

// Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

// --- MainFeed Component (Uses Context) ---
const MainFeed = ({ posts, loading, error, handleNewPost, updatePostScore, onDeletePost }) => {
    const { user } = useContext(AuthContext);

    return (
        <section className="main-feed-section">
            <h2>Main Feed</h2>

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

                        {/* ✅ ADDITIVE: Edit / Delete (NO styling changes) */}
                        {user && user.id === post.author_id && (
                            <div>
                                <Link to={`/post/${post.id}`} style={{ marginRight: "10px" }}>
                                    Edit
                                </Link>
                                <button onClick={() => onDeletePost(post.id)}>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {!loading && !error && posts.length === 0 && (
                <p>No posts found. Be the first to post!</p>
            )}
        </section>
    );
};

// --- Main App ---
function App() {
    const [view, setView] = useState('login');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/posts`, { credentials: "include" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch posts");
                setPosts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleNewPost = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const updatePostScore = (postId, newScore) => {
        setPosts(prev =>
            prev.map(post =>
                post.id === postId ? { ...post, vote_score: newScore } : post
            )
        );
    };

    // ✅ NEW: delete post handler
    const handleDeletePost = async (postId) => {
        await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: "DELETE",
            credentials: "include"
        });
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    // --- AppContent ---
    const AppContent = () => {
        const { user, setUser, isDarkMode, setIsDarkMode } = useContext(AuthContext);

        const toggleSidebar = () => setIsSidebarVisible(prev => !prev);
        const toggleTheme = () => setIsDarkMode(prev => !prev);

        return (
            <div className={`app-container ${isDarkMode ? 'dark-mode' : ''} ${!isSidebarVisible ? 'sidebar-hidden' : ''}`}>
                {/* HEADER */}
                <header className="app-header">
                    <div className="header-left">
                        <button onClick={toggleSidebar} className="sidebar-toggle-btn">
                            {isSidebarVisible ? '✖' : '☰'}
                        </button>
                        <h1>
                            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                                Mini-Reddit Forum
                            </Link>
                        </h1>
                    </div>

                    <div className="header-right">
                        <button onClick={toggleTheme} className="theme-toggle-btn">
                            {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
                        </button>

                        {user && (
                            <div className="user-status-container">
                                <p>Logged in as: <strong>{user.username}</strong></p>
                                <button
                                    className="logout-btn"
                                    onClick={() => {
                                        setUser(null);
                                        setView('login');
                                    }}
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {isSidebarVisible && (
                    <aside className="sidebar">
                        {!user ? (
                            <>
                                <nav className="auth-nav">
                                    <button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>Log In</button>
                                    <button className={view === 'signup' ? 'active' : ''} onClick={() => setView('signup')}>Sign Up</button>
                                </nav>

                                <div className="login-form-container">
                                    {view === 'login' && <LoginForm />}
                                    {view === 'signup' && <SignupForm />}
                                </div>
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
                                onDeletePost={handleDeletePost}
                            />
                        }
                    />
                    <Route path="/post/:postId" element={<PostDetail updatePostScore={updatePostScore} />} />
                    <Route path="/popular" element={<div className="main-feed-section"><h2>Popular Posts</h2></div>} />
                    <Route path="/profile" element={<Profile />} />
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
