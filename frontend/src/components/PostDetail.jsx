// forum-app/frontend/src/components/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VoteController from './VoteController';
import CommentForm from './CommentForm'; // NEW IMPORT

// IMPORTANT: Use your actual Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; 

function PostDetail({ user, updatePostScore }) {
  const { postId } = useParams();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]); // NEW STATE for comments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch both post and comments
  const fetchPostAndComments = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Post Details
      const postResponse = await fetch(`${API_BASE_URL}/posts/${postId}`);
      if (!postResponse.ok) {
        throw new Error(`Post not found (Status: ${postResponse.status})`);
      }
      const postData = await postResponse.json();
      setPost(postData);

      // 2. Fetch Comments for the Post
      const commentsResponse = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
      if (!commentsResponse.ok) {
         // Log but don't crash if comments fail, as the post might still load
         console.warn("Could not fetch comments.");
      } else {
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      }
      
    } catch (e) {
      console.error("Fetch Error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Callback to instantly add the new comment to the state
  const handleNewComment = (newComment) => {
    // Add the new comment to the top of the list
    setComments(prevComments => [newComment, ...prevComments]); 
  };


  useEffect(() => {
    fetchPostAndComments();
  }, [postId]); // Re-run effect if postId changes

  if (loading) {
    return <p className="loading-message">Loading Post and Comments...</p>;
  }

  if (error || !post) {
    return (
      <div className="error-page-container">
        <p className="error-message" style={{color: 'red', padding: '20px'}}>Error: {error || "Post not found."}</p>
        <Link to="/" style={{display: 'block', padding: '20px'}}>Go back to Main Feed</Link>
      </div>
    );
  }

  return (
    <div className="main-feed-section"> 
      
      {/* ----------------------------------
        POST DETAIL CARD
      -----------------------------------*/}
      <div className="post-detail-card post-card-wrapper">
        
        <VoteController 
          postId={post.id} 
          initialScore={post.vote_score || 0} 
          user={user} 
          onScoreUpdate={updatePostScore} 
        />

        <div className="post-detail-content post-content">
          <h2 className="post-detail-title">{post.title}</h2>
          <p className="post-metadata">
            Posted by: **{post.author_username || 'Anonymous'}** | Score: {post.vote_score || 0}
          </p>
          <hr style={{margin: '15px 0', borderTop: '1px solid var(--color-border-subtle)'}}/>
          
          <p className="post-detail-body">{post.body}</p>
        </div>
      </div>
      
      {/* ----------------------------------
        COMMENTS SECTION
      -----------------------------------*/}
      <div className="comments-section">
        <h3 style={{marginBottom: '20px'}}>{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h3>
        
        {/* Comment Submission Form */}
        <CommentForm 
          postId={post.id} 
          user={user} 
          onCommentCreated={handleNewComment}
        />

        {/* Display Comments */}
        <div className="comment-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-card">
              <p className="comment-author">
                **{comment.author_username || 'Anonymous'}**
              </p>
              <p className="comment-body">{comment.body}</p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default PostDetail;