// forum-app/frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import PostForm from './components/PostForm';
import VoteController from './components/VoteController';
import PostDetail from './components/PostDetail';
// 1. Import AuthContext so we can consume the state we just moved
import { AuthProvider, AuthContext } from './context/AuthContext';
// 1b. We need useContext to get the values from AuthContext
import { useContext } from 'react';


// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

// --- MainFeed Component (No Change Here Yet, it will be updated after App.jsx) ---
const MainFeed = ({ posts, loading, error, handleNewPost, updatePostScore }) => {
    // 1. Get user from context
    const { user } = useContext(AuthContext);

    return (
        <section className="main-feed-section">
            <h2>Main Feed</h2>

            {/* 2. PostForm no longer needs the user prop passed from here */}
            {user && <PostForm onPostCreated={handleNewPost} />}

            {loading && <p>Loading Posts...</p>}
            {error && <p style={{ color: 'red' }}>Error fetching posts: {error}</p>}

            {!loading && !error && posts.length > 0 && posts.map(post => (
                <div key={post.id} className="post-card-wrapper">

                    {/* 3. VoteController no longer needs the user prop passed from here */}
                    <VoteController
                        postId={post.id}
                        initialScore={post.vote_score || 0}
                        // user={user} // REMOVED
                        onScoreUpdate={updatePostScore}
                    />

                    <div className="post-content">
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
};


// The main App component now contains the router context and state
function App() {

    // 2. DELETE STATE: These states are now managed by AuthContext
    // const [user, setUser] = useState(null);
    // const [isDarkMode, setIsDarkMode] = useState(false);

    // 3. KEEP ONLY POSTS STATE: We will keep these here for now, as they are specific to the feed
    const [view, setView] = useState('login');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- THEME AND AUTH HANDLERS ---
    // 4. We will remove the definition of toggleTheme, handleLogin, and handleSignup
    // as they should be moved to AuthContext or LoginForm/SignupForm

    // Since we are skipping the backend for now, we'll need a place to grab the AuthContext functions later.
    // For the immediate refactor, we will rely on AuthProvider wrapping the whole app.

    // NOTE: We need a temporary component to hold the AuthContext usage to pass state to MainFeed.
    // We will pass the necessary setters and state through the AuthContext for the components that need it.

    // 5. POST HANDLERS - Keep these in App.jsx as they manage the posts array state
    const handleNewPost = (newPost) => {
        // NOTE: This will require getting `user` from context later.
        const postWithDefaults = {
            ...newPost,
            vote_score: newPost.vote_score || 0,
            // We will need to get the user from context later!
            // author_username: user.username,
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


    // --- New component to use Context and manage the Header/Sidebar logic ---
    const AppContent = () => {
        // 6. CONSUME CONTEXT STATE
        const { user, isDarkMode, setIsDarkMode, setUser } = useContext(AuthContext);

        // 7. MOVE TOGGLE THEME FUNCTION HERE
        const toggleTheme = () => {
            setIsDarkMode(prevMode => !prevMode);
        };

        // 8. MOVE AUTH HANDLERS HERE (or delete since we are skipping backend for now)
        const handleLogin = (userData, authToken) => {
            setUser(userData);
            alert(`Welcome back, ${userData.username}!`);
        };

        const handleSignup = (userData, authToken) => {
            setUser(userData);
            alert(`Account created! Welcome, ${userData.username}!`);
        };


        // 9. THE OVERALL APP STRUCTURE (previously in the main return)
        return (
            <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>

                {/* Header is STATIC (now using context state) */}
                <header className="app-header">
                    <h1>
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

                {/* Sidebar is STATIC (now using context state) */}
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
                        {/* The forms need the new handleLogin/Signup functions */}
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

                {/* 10. ROUTES: Now we must pass the state from App.jsx that WAS NOT moved (posts, loading, handlers) */}
                <Routes>
                    {/* Route 1: Main Feed (path is '/') - NOTE: We removed the `user` prop */}
                    <Route
                        path="/"
                        element={<MainFeed
                            // user={user} // REMOVED - MainFeed must now consume context
                            posts={posts}
                            loading={loading}
                            error={error}
                            handleNewPost={handleNewPost}
                            updatePostScore={updatePostScore}
                        />}
                    />

                    {/* Route 2: Post Detail Page (path is '/post/123') - NOTE: We removed the `user` prop */}
                    <Route
                        path="/post/:postId"
                        element={<PostDetail
                            // user={user} // REMOVED - PostDetail must now consume context
                            updatePostScore={updatePostScore}
                        />}
                    />
                </Routes>
            </div>
        );
    }; // End of AppContent component


    // The overall App component (Final Return)
    return (
        // 11. The Router only needs to wrap the AppContent which is now wrapped in AuthProvider
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;