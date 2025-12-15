// forum-app/frontend/src/components/PostForm.jsx
import React, { useState } from 'react';

// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; 

// The component receives the current user object and a function to update the post list
function PostForm({ user, onPostCreated }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!title.trim() || !body.trim()) {
        setError("Title and body cannot be empty.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authentication Placeholder: 
          // In a real app, this should be Authorization: Bearer <token>
          'X-User-ID': user.id // Sends the user ID to the backend for post ownership
        },
        body: JSON.stringify({ title, body }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post. Check backend authorization.');
      }

      // Post Successful!
      const newPost = await response.json();
      
      // Call the function from App.jsx to update the main post list
      onPostCreated(newPost); 
      
      // Clear the form
      setTitle('');
      setBody('');
      
      // Optionally provide success feedback
      // alert("Post successfully created!"); 

    } catch (e) {
      console.error("Post Creation Error:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Reusing 'post-card' class for a consistent look, 
    // adding 'post-submission-form' for specific styling
    <div className="post-submission-form post-card"> 
      <h3>Create a New Post</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
          className="post-title-input"
        />
        <textarea
          placeholder="What's on your mind? (Body Text)"
          rows="5"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          disabled={isLoading}
          className="post-body-textarea"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Post'}
        </button>
      </form>
      {error && <p className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</p>}
    </div>
  );
}

export default PostForm;