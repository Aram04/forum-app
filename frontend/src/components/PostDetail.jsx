// forum-app/frontend/src/components/PostDetail.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteController from './VoteController';
import CommentForm from './CommentForm'; // We will create this next
import { AuthContext } from '../context/AuthContext'; // To consume user data

// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; 

function PostDetail({ updatePostScore }) {
    
    const { postId } = useParams(); // Get the post ID from the URL
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Consume user from context

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data Fetching Effect ---
    useEffect(() => {
        const fetchPostAndComments = async () => {
            setLoading(true);
            try {
                // Fetch the single post (which should ideally include comments)
                const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
                
                if (!response.ok) {
                    // If the post is not found (404), redirect to the home page
                    if (response.status === 404) {
                        alert("Post not found.");
                        navigate('/'); 
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setPost(data.post);
                setComments(data.comments || []); // Assume the response includes a comments array

            } catch (e) {
                console.error("Could not fetch post details:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPostAndComments();
        }
    }, [postId, navigate]);


    // Handler for new comment submission
    const handleNewComment = (newComment) => {
        // Add the new comment to the top of the comments list
        setComments(prevComments => [newComment, ...prevComments]);
    };

    // Handler for updating the score (passed down from App.jsx)
    const handleScoreUpdate = (id, newScore) => {
        // Update the local post state and call the App.jsx handler
        setPost(prevPost => ({ ...prevPost, vote_score: newScore }));
        updatePostScore(id, newScore);
    };


    if (loading) return <p>Loading post...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
    if (!post) return null; // Should be covered by loading/error, but good fallback

    return (
        <main className="post-detail-page">
            <div className="post-card-wrapper detail-view">
                
                <VoteController 
                    postId={post.id} 
                    initialScore={post.vote_score || 0} 
                    onScoreUpdate={handleScoreUpdate}
                />
                
                <div className="post-content">
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-metadata">
                        Score: {post.vote_score || 0} | Author: {post.author_username || 'Anonymous'}
                    </p>
                    <div className="post-body">
                        {/* Display the body/content of the post */}
                        <p>{post.body}</p>
                    </div>
                </div>
            </div>

            <section className="comments-section">
                <h3>Comments ({comments.length})</h3>
                
                {/* 1. Comment Submission Form (only visible if user is logged in) */}
                {user ? (
                    <CommentForm 
                        postId={post.id} 
                        onCommentCreated={handleNewComment}
                    />
                ) : (
                    <p className="login-prompt">Please log in to leave a comment.</p>
                )}

                {/* 2. List of Existing Comments */}
                <div className="comments-list">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="comment-card">
                                <p className="comment-author">
                                    <strong>{comment.author_username || 'Anonymous'}</strong>:
                                </p>
                                <p className="comment-body">{comment.text}</p>
                                {/* Add vote control for comments if desired */}
                            </div>
                        ))
                    ) : (
                        <p>No comments yet. Be the first to reply!</p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default PostDetail;