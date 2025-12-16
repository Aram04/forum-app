// forum-app/frontend/src/components/PostDetail.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteController from './VoteController';
import CommentForm from './CommentForm';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function PostDetail({ updatePostScore }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const postRes = await fetch(`${API_BASE_URL}/posts/${postId}`);
            if (!postRes.ok) {
                navigate('/');
                return;
            }
            const postData = await postRes.json();
            setPost(postData);

            const commentsRes = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
            if (commentsRes.ok) {
                setComments(await commentsRes.json());
            }

            setLoading(false);
        };
        fetchData();
    }, [postId, navigate]);

    if (loading || !post) return null;

    return (
        <div className="post-detail-container">
            <VoteController
                postId={post.id}
                initialScore={post.vote_score || 0}
                onScoreUpdate={(id, score) => {
                    setPost(prev => ({ ...prev, vote_score: score }));
                    updatePostScore(id, score);
                }}
            />

            <h1>{post.title}</h1>

            <p className="post-metadata">
                Score: {post.vote_score} | Author: {post.author_username}
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
                                setPost(prev => ({ ...prev, title: newTitle, body: newBody }));
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
                                navigate("/");
                            }
                        }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}

            <p className="post-body">{post.body}</p>

            <section className="comments-section">
                <h2>Comments</h2>
                {user && <CommentForm postId={post.id} onCommentCreated={c => setComments(p => [c, ...p])} />}
                {comments.map(c => (
                    <div key={c.id} className="comment-card">
                        <p>{c.body}</p>
                        <small>— {c.author_username}</small>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default PostDetail;
