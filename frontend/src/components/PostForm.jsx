// forum-app/frontend/src/components/PostForm.jsx

import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// IMPORTANT: Use your actual Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

/**
 * Component for creating a new post.
 * @param {object} props
 * @param {function} props.onPostCreated - Callback to update the feed state in App.jsx.
 */
function PostForm({ onPostCreated }) {
  // Consume the user from AuthContext
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // If the user logs out while this component is visible
  if (!user) {
    // This should not happen if App.jsx logic is correct, but good safety measure
    return <p>Please log in to post.</p>;
  }

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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // CRITICAL: Send the user ID (author ID) in a custom header
          "X-User-ID": user.id,
        },
        body: JSON.stringify({ title, body, author_id: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create post. Check backend logic."
        );
      }

      const newPost = await response.json();

      // Add the current username to the post object for immediate display
      const postWithAuthor = {
        ...newPost,
        author_username: user.username,
      };

      // Call the function in App.jsx to update the main feed list
      onPostCreated(postWithAuthor);

      // Clear the form
      setTitle("");
      setBody("");
    } catch (e) {
      console.error("Post Submission Error:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <form onSubmit={handleSubmit} className="post-form"> 
            <h4>Create a New Post</h4>
            
            <div className="post-form-fields">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
                    className="post-form-title-input" 
                />
                <textarea
                    placeholder="What are your thoughts?"
                    rows="4"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    disabled={isLoading}
                    className="post-form-body-textarea" 
                />
            </div>
            
            {/* --- CRITICAL: Ensure this button element is present --- */}
            <button type="submit" disabled={isLoading} className="post-form-submit-btn">
                {isLoading ? 'Posting...' : 'Submit Post'}
            </button> 
            
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}

export default PostForm;