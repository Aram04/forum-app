// forum-app/frontend/src/components/PostDetail.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteController from './VoteController';
import CommentForm from './CommentForm'; 
import { AuthContext } from '../context/AuthContext'; 

// IMPORTANT: Use your actual Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

/**
 * Component to display a single post and its comments.
 * @param {object} props
 * @param {function} props.updatePostScore - Callback to update the score in App.jsx.
 */
function PostDetail({ updatePostScore }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Fetch post + comments ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const postRes = await fetch(`${API_BASE_URL}/posts/${postId}`);
                if (!postRes.ok) {
                    navigate('/', { replace: true });
                    return;
                }

                const postData = await postRes.json();
                setPost(postData);

                const commentsRes = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    setComments(commentsData);
                }

                setError(null);
            } catch (e) {
                console.error("PostDetail fetch error:", e);
                setError("Failed to load post.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId, navigate]);

    // --- Add new comment instantly ---
    const handleCommentCreated = (newComment) => {
        setComments(prev => [newComment, ...prev]);
    };

    if (loading) return <p className="post-detail-loading">Loading Post...</p>;
    if (error) return <p className="post-detail-error">{error}</p>;
    if (!post) return null;

    return (
        <div className="post-detail-container">
            <article className="post-content-full">
                <div className="vote-and-content">
                    {/* 🔑 FIX: keep vote state in PostDetail */}
                    <VoteController 
                        postId={post.id}
                        initialScore={post.vote_score || 0}
                        onScoreUpdate={(id, newScore) => {
                            setPost(prev => ({ ...prev, vote_score: newScore }));
                            updatePostScore(id, newScore);
                        }}
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

                {/* Comment form */}
                {user && (
                    <CommentForm 
                        postId={post.id}
                        onCommentCreated={handleCommentCreated}
                    />
                )}

                {/* Comment list */}
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
