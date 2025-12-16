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
const MainFeed = ({ posts, loading, error, handleNewPost, updatePostScore, setPosts }) => {
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

                        {/* ✅ EDIT / DELETE (OWNER ONLY) */}
                        {user && user.id === post.author_id && (
                            <div className="post-owner-actions">
                                <button
                                    onClick={async () => {
                                        const newTitle = prompt("Edit title:", post.title);
                                        const newBody = prompt("Edit body:", post.body);
                                        if (!newTitle || !newBody) return;

                                        const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            credentials: "include",
                                            body: JSON.stringify({ title: newTitle, body: newBody })
                                        });

                                        if (res.ok) {
                                            setPosts(prev =>
                                                prev.map(p =>
                                                    p.id === post.id
                                                        ? { ...p, title: newTitle, body: newBody }
                                                        : p
                                                )
                                            );
                                        }
                                    }}
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Delete this post?")) return;

                                        const res = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
                                            method: "DELETE",
                                            credentials: "include"
                                        });

                                        if (res.ok) {
                                            setPosts(prev => prev.filter(p => p.id !== post.id));
                                        }
                                    }}
                                >
                                    🗑️ Delete
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
                const res = await fetch(`${API_BASE_URL}/posts`, {
                    credentials: "include"
                });
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

    const AppContent = () => {
        const { user, setUser, isDarkMode, setIsDarkMode } = useContext(AuthContext);

        return (
            <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
                {/* HEADER + SIDEBAR unchanged */}

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
                                setPosts={setPosts}
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
