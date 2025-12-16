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
    const [view, setView] = useState('login');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleNewPost = (newPost) => {
        const postWithDefaults = {
            ...newPost,
            id: Date.now(), // Assign temporary ID for frontend display
            vote_score: newPost.vote_score || 0,
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

    // --- FETCH POSTS EFFECT (DISABLED FOR FRONTEND FOCUS) ---
    useEffect(() => {
        // fetch(`${API_BASE_URL}/posts`)
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error(`HTTP error! status: ${response.status}`);
        //         }
        //         return response.json();
        //     })
        //     .then(data => {
        //         setPosts(data);
        //         setLoading(false);
        //     })
        //     .catch(e => {
        //         console.error("Could not fetch posts:", e);
        //         setError(e.message);
        //         setLoading(false);
        //     });
        
        // --- TEMPORARY DUMMY DATA FOR TESTING POST DETAIL PAGE ---
        setPosts([
            { id: 101, title: "Welcome to the Dev Forum!", body: "This is a test post to ensure the PostDetail page works. Click on me!", vote_score: 5, author_username: "Admin" },
            { id: 102, title: "Another Test Post", body: "Check the voting controls!", vote_score: 1, author_username: "User2" },
        ]);
        setLoading(false);
    }, []);


    // --- AppContent Component to use Context and manage the Header/Sidebar logic ---
    // 1. AppContent now accepts setView as a prop
    const AppContent = ({ setView }) => { 
        const { user, isDarkMode, setIsDarkMode, setUser } = useContext(AuthContext);

        const TEST_USER = {
            id: 999,
            username: "TestDevUser",
            level: "user" 
        };

        const handleQuickLogin = () => {
            setUser(TEST_USER);
            alert(`Bypassed login! Logged in as ${TEST_USER.username}.`);
            setView('feed'); 
        };

        const toggleTheme = () => {
            setIsDarkMode(prevMode => !prevMode);
        };

        const handleLogin = (userData, authToken) => {
            setUser(userData);
            alert(`Welcome back, ${userData.username}!`);
        };

        const handleSignup = (userData, authToken) => {
            setUser(userData);
            alert(`Account created! Welcome, ${userData.username}!`);
        };


        return (
            <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>

                {/* Header */}
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
                        <p>Logged in as: <strong>{user.username}</strong> (
                            <a 
                                href="#" 
                                onClick={() => {
                                    setUser(null); 
                                    setView('login'); // 2. Reset view to 'login' on logout
                                }}
                            >
                                Log Out
                            </a>
                        )</p>
                    ) : (
                        <p>Please log in or sign up.</p>
                    )}
                </header>

                {/* Sidebar */}
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
                        {/* Forms appear if user is null AND view state is correct */}
                        {!user && view === 'login' && <LoginForm onLogin={handleLogin} />}
                        {!user && view === 'signup' && <SignupForm onSignup={handleSignup} />}
                    </div>
                    
                    {/* --- QUICK LOGIN BYPASS BUTTON --- */}
                    {!user && (
                        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'rgba(0, 150, 0, 0.2)', border: '1px solid #28a745', borderRadius: '4px' }}>
                            <p style={{ fontSize: '0.8em', marginBottom: '5px', color: '#28a745' }}>**DEV BYPASS**</p>
                            <button 
                                onClick={handleQuickLogin}
                                style={{ 
                                    width: '100%', 
                                    padding: '8px', 
                                    backgroundColor: '#28a745', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Log In as Dev User
                            </button>
                        </div>
                    )}
                    {/* --- END QUICK LOGIN BYPASS --- */}


                    {user && (
                        <div className="create-post-prompt">
                            <p>Welcome, {user.username}.</p>
                            <p>Post a new topic in the main feed!</p>
                        </div>
                    )}
                </aside>

                {/* ROUTES */}
                <Routes>
                    <Route
                        path="/"
                        element={<MainFeed
                            posts={posts}
                            loading={loading}
                            error={error}
                            handleNewPost={handleNewPost}
                            updatePostScore={updatePostScore}
                        />}
                    />

                    <Route
                        path="/post/:postId"
                        element={<PostDetail
                            updatePostScore={updatePostScore}
                        />}
                    />
                </Routes>
            </div>
        );
    }; // End of AppContent component


    // The overall App component (Final Return)
    return (
        <Router>
            <AuthProvider>
                {/* 3. Pass setView to the AppContent component */}
                <AppContent setView={setView} /> 
            </AuthProvider>
        </Router>
    );
}

export default App;