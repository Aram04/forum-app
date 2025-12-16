// forum-app/frontend/src/components/PostForm.jsx

import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

/**
 * Component for creating a new post.
 * @param {object} props
 * @param {function} props.onPostCreated - Callback to update the feed state in App.jsx.
 */
function PostForm({ onPostCreated }) {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return <p>Please log in to post.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title.trim() || !body.trim()) {
      setError("Title and body cannot be empty.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        credentials: "include", // ✅ REQUIRED for session auth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post.");
      }

      onPostCreated(data);

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

      <button
        type="submit"
        disabled={isLoading}
        className="post-form-submit-btn"
      >
        {isLoading ? "Posting..." : "Submit Post"}
      </button>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
}

export default PostForm;
