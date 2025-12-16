// forum-app/frontend/src/components/PostDetail.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteController from './VoteController';
import CommentForm from './CommentForm'; 
import { AuthContext } from '../context/AuthContext'; 

// IMPORTANT: Use your actual Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function PostDetail({ updatePostScore }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/posts/${postId}`,
                    { credentials: "include" }   // ✅ REQUIRED
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        navigate('/', { replace: true });
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setPost(data);
                setError(null);

                await fetchComments();
            } catch (e) {
                console.error("Could not fetch post:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/posts/${postId}/comments`,
                    { credentials: "include" }   // ✅ REQUIRED
                );

                if (!response.ok) {
                    throw new Error(`HTTP error fetching comments! status: ${response.status}`);
                }

                const data = await response.json();
                setComments(data);
            } catch (e) {
                console.error("Could not fetch comments:", e);
            }
        };

        fetchPost();
    }, [postId, navigate]);

    const handleCommentCreated = (newComment) => {
        setComments(prev => [newComment, ...prev]);
    };

    if (loading) return <p className="post-detail-loading">Loading Post...</p>;
    if (error && !post) return <p className="post-detail-error">Error: {error}</p>;
    if (!post) return <p className="post-detail-not-found">Post not found.</p>;

    return (
        <div className="post-detail-container">
            <article className="post-content-full">
                <div className="vote-and-content">
                    <VoteController
                        postId={post.id}
                        initialScore={post.vote_score || 0}
                        onScoreUpdate={updatePostScore}
                    />

                    <div className="post-main-area">
                        <h1>{post.title}</h1>
                        <p className="post-metadata">
                            Score: {post.vote_score || 0} | 
                            Author: {post.author_username || 'Anonymous'}
                        </p>
                        <hr />
                        <p className="post-body">{post.body}</p>
                    </div>
                </div>
            </article>

            <section className="comments-section">
                <h2>Comments</h2>
                {user && (
                    <CommentForm
                        postId={post.id}
                        onCommentCreated={handleCommentCreated}
                    />
                )}

                <div className="comment-list">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-card">
                                <p className="comment-body">{comment.body}</p>
                                <p className="comment-author">
                                    — {comment.author_username || 'Anonymous'}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default PostDetail;
