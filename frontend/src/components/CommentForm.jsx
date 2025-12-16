// forum-app/frontend/src/components/CommentForm.jsx
import React, { useState } from 'react';

// IMPORTANT: Use your actual Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

/**
 * Component for submitting a new comment.
 * @param {object} props
 * @param {number} props.postId - The ID of the post to comment on.
 * @param {object} props.user - The current logged-in user object.
 * @param {function} props.onCommentCreated - Callback to update the comment list in PostDetail.
 */
function CommentForm({ postId, user, onCommentCreated }) {
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the user is logged in before rendering the form
  if (!user) {
    return <p className="comment-login-prompt">Please log in to leave a comment.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
          // Authentication Placeholder
          'X-User-ID': user.id, // Sends the user ID to the backend
        },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment. Check backend logic.');
      }

      const newComment = await response.json();
      
      // Add the current username to the comment object (since the backend usually returns ID only)
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
        <button type="submit" disabled={isLoading || !user}>
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
      {error && <p className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
    </div>
  );
}

export default CommentForm;