// forum-app/frontend/src/components/CommentForm.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

// IMPORTANT: Use your actual Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

/**
 * Component for submitting a new comment.
 * @param {object} props
 * @param {number} props.postId - The ID of the post to comment on.
 * @param {function} props.onCommentCreated - Callback to update the comment list in PostDetail.
 */
function CommentForm({ postId, onCommentCreated }) {
    
    // Consume the user from AuthContext
    const { user } = useContext(AuthContext); 

    const [body, setBody] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // If the user logs out while this component is visible
    if (!user) {
      return <p className="comment-login-prompt">Please log in to leave a comment.</p>;
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      if (!user || !user.id) {
          setError("Authentication failed. Please log in again.");
          setIsLoading(false);
          return;
      }
      
      if (!body.trim()) {
          setError("Comment body cannot be empty.");
          setIsLoading(false);
          return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Authentication Placeholder: Use the user ID obtained from context
            'X-User-ID': user.id, // Sends the user ID to the backend
          },
          body: JSON.stringify({ body, post_id: postId }), // Include post_id in body
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to post comment. Check backend logic.');
        }

        const newComment = await response.json();
        
        // Add the current username to the comment object for immediate display
        const commentWithAuthor = {
          ...newComment,
          author_username: user.username,
        };

        // Call the function in PostDetail.jsx to update the list
        onCommentCreated(commentWithAuthor); 
        
        // Clear the form
        setBody('');
        
      } catch (e) {
        console.error("Comment Submission Error:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="comment-form-container">
        <h4>Comment as {user.username}</h4>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="What are your thoughts?"
            rows="3"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            disabled={isLoading}
            className="comment-body-textarea"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
          {error && <p className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
        </form>
      </div>
    );
}

export default CommentForm;