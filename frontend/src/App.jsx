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

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

/* ---------------- MAIN FEED ---------------- */
const MainFeed = ({ posts, loading, error, handleNewPost, updatePostScore, onDeletePost }) => {
    const { user } = useContext(AuthContext);

    return (
        <section className="main-feed-section">
            <h2>Main Feed</h2>

            {user && <PostForm onPostCreated={handleNewPost} />}

            {loading && <p>Loading Posts...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

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
                            Score: {post.vote_score || 0} | Author: {post.author_username}
                        </p>

                        {/* ✅ EDIT / DELETE — SAFE */}
                        {user && user.id === post.author_id && (
                            <div style={{ marginTop: "6px" }}>
                                <button
                                    onClick={() => onDeletePost(post.id)}
                                    style={{ marginRight: "8px" }}
                                >
                                    Delete
                                </button>
                                <Link to={`/post/${post.id}`} style={{ fontSize: "0.85em" }}>
                                    Edit
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {!loading && !error && posts.length === 0 && (
                <p>No posts yet.</p>
            )}
        </section>
    );
};

/* ---------------- APP ---------------- */
function App() {
    const [view, setView] = useState('login');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/posts`, { credentials: "include" })
            .then(res => res.json())
            .then(setPosts)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleNewPost = post => setPosts(prev => [post, ...prev]);

    const updatePostScore = (id, score) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, vote_score: score } : p));
    };

    const deletePost = async (postId) => {
        await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: "DELETE",
            credentials: "include"
        });
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const AppContent = () => {
        const { user, setUser, isDarkMode, setIsDarkMode } = useContext(AuthContext);

        return (
            <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
                {/* HEADER */}
                <header className="app-header">
                    <div className="header-left">
                        <button onClick={() => setIsSidebarVisible(v => !v)}>
                            {isSidebarVisible ? '✖' : '☰'}
                        </button>
                        <h1><Link to="/">Mini-Reddit Forum</Link></h1>
                    </div>

                    <div className="header-right">
                        <button onClick={() => setIsDarkMode(v => !v)}>
                            {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
                        </button>

                        {user && (
                            <button onClick={() => setUser(null)}>Log Out</button>
                        )}
                    </div>
                </header>

                {/* SIDEBAR */}
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
                                <h3>{user.username}</h3>
                                <ul>
                                    <li><Link to="/">🏠 Home</Link></li>
                                    <li><Link to="/profile">👤 Profile</Link></li>
                                </ul>
                            </nav>
                        )}
                    </aside>
                )}

                {/* ROUTES */}
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
                                onDeletePost={deletePost}
                            />
                        }
                    />
                    <Route path="/post/:postId" element={<PostDetail />} />
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
