import React, { useEffect, useState } from "react";
import VoteController from "./VoteController";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function Popular() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/posts/popular`, {
                    credentials: "include"
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Failed to fetch popular posts");
                }

                const data = await res.json();
                setPosts(data);
            } catch (e) {
                console.error("Popular fetch error:", e);
                setError("Failed to load popular posts.");
            } finally {
                setLoading(false);
            }
        };

        fetchPopular();
    }, []);

    if (loading) return <p>Loading popular posts...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <section className="main-feed-section">
            <h2>🔥 Popular Posts</h2>

            {posts.length === 0 && <p>No posts yet.</p>}

            {posts.map(post => (
                <div key={post.id} className="post-card-wrapper">
                    <VoteController
                        postId={post.id}
                        initialScore={post.vote_score}
                        onScoreUpdate={() => {}}
                    />

                    <div className="post-content">
                        <Link to={`/post/${post.id}`} className="post-title-link">
                            <h3>{post.title}</h3>
                        </Link>

                        <p className="post-metadata">
                            Score: {post.vote_score} | Author: {post.author_username}
                        </p>
                    </div>
                </div>
            ))}
        </section>
    );
}

export default Popular;
