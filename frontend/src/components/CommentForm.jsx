import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function CommentForm({ postId, onCommentCreated }) {
    const { user } = useContext(AuthContext);
    const [body, setBody] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!user) {
        return <p className="comment-login-prompt">Please log in to leave a comment.</p>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/posts/${postId}/comments`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ body })
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            onCommentCreated(data);
            setBody("");
        } catch (e) {
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
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Posting..." : "Post Comment"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default CommentForm;
