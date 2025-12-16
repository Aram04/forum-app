// forum-app/frontend/src/components/VoteController.jsx
import React, { useState } from 'react';

// IMPORTANT: Use your actual Render URL
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

/**
 * Component to handle upvoting and downvoting for a single post.
 * * @param {object} props
 * @param {number} props.postId - The ID of the post being voted on.
 * @param {number} props.initialScore - The current score of the post.
 * @param {object} props.user - The current logged-in user object (or null).
 * @param {function} props.onScoreUpdate - Callback function to update the post score in App.jsx state.
 */
function VoteController({ postId, initialScore = 0, user, onScoreUpdate }) {
  // Use state to manage the score locally, initialized with the post's current score
  const [currentScore, setCurrentScore] = useState(initialScore);
  const [error, setError] = useState(null);

  // A helper function to send the vote to the backend
  const handleVote = async (direction) => {
    // 1. Authorization Check
    if (!user) {
      setError("You must be logged in to vote.");
      return;
    }
    
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authentication Placeholder: We send the user ID as a header.
          // NOTE: A proper app uses a Bearer Token via the Authorization header.
          'X-User-ID': user.id, 
        },
        body: JSON.stringify({ direction }), // 'up' or 'down'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Vote failed. Please check backend logic.');
      }

      // 2. Update State on Success
      const data = await response.json();
      const newScore = data.new_score;
      
      // Update the score displayed locally
      setCurrentScore(newScore); 
      
      // Update the score in the parent component (App.jsx)
      onScoreUpdate(postId, newScore); 
      
    } catch (e) {
      console.error("Voting Error:", e);
      // If the user hasn't voted recently, show the error message.
      setError(e.message);
    }
  };

  return (
    <div className="vote-controller">
      {/* Upvote Button (sends 'up' direction) */}
      <button 
        onClick={() => handleVote('up')} 
        className="vote-button upvote"
        disabled={!user}
      >
        ▲
      </button>
      
      {/* Score Display */}
      <span className="vote-score">{currentScore}</span>
      
      {/* Downvote Button (sends 'down' direction) */}
      <button 
        onClick={() => handleVote('down')} 
        className="vote-button downvote"
        disabled={!user}
      >
        ▼
      </button>

      {/* Display error message if the vote fails or user isn't logged in */}
      {error && <p className="vote-error" style={{color: 'red', fontSize: '0.7em'}}>{error}</p>}
    </div>
  );
}

export default VoteController;