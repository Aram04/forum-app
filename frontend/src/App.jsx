// forum-app/frontend/src/App.jsx

import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import PostForm from './components/PostForm';
import VoteController from './components/VoteController';
import PostDetail from './components/PostDetail';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Render URL!
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

            {!loading && !error && posts.length > 0 && posts.map(post => (
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
                            Score: {post.vote_score || 0} | Author: {post.author_username || 'Anonymous'}
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // FETCH POSTS ON LOAD (THIS FIXES JSON + FORMATTING ISSUES)
    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/posts`, {
            credentials: "include"
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch posts");
                return res.json();
            })
            .then(data => {
                setPosts(data);
                setError(null);
            })
            .catch(err => {
                console.error("Fetch posts error:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
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

    const AppContent = ({ setView, isSidebarVisible, setIsSidebarVisible }) => {
        const { user, isDarkMode, setIsDarkMode, setUser } = useContext(AuthContext);

        const toggleTheme = () => setIsDarkMode(prev => !prev);
        const toggleSidebar = () => setIsSidebarVisible(prev => !prev);

        const handleLogin = (userData) => {
            setUser(userData);
            setView('feed');
        };

        const handleSignup = (userData) => {
            setUser(userData);
            setView('feed');
        };

        return (
            <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
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

                        {user ? (
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

                                <div className="login-form-container">
                                    {view === 'login' && <LoginForm onLogin={handleLogin} />}
                                    {view === 'signup' && <SignupForm onSignup={handleSignup} />}
                                </div>
                            </>
                        ) : (
                            <nav className="user-nav-links">
                                <h3>Welcome, {user.username}</h3>
                                <ul>
                                    <li><Link to="/">🏠 Home</Link></li>
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
                </Routes>
            </div>
        );
    };

    return (
        <Router>
            <AuthProvider>
                <AppContent
                    setView={setView}
                    isSidebarVisible={isSidebarVisible}
                    setIsSidebarVisible={setIsSidebarVisible}
                />
            </AuthProvider>
        </Router>
    );
}

export default App;
