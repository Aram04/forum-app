// forum-app/frontend/src/components/VoteController.jsx

import React, { useState, useEffect, useContext } from 'react'; // 1. Add useContext
import { AuthContext } from '../context/AuthContext'; // 2. Import AuthContext

// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; 

// 3. Remove the 'user' prop from the function signature
function VoteController({ postId, initialScore, onScoreUpdate }) {
    
    // 4. Consume the user from context
    const { user } = useContext(AuthContext); 
    
    // State to track the current score and the user's vote status
    const [score, setScore] = useState(initialScore);
    const [userVote, setUserVote] = useState(0); // 1 for upvote, -1 for downvote, 0 for none
    const [isLoading, setIsLoading] = useState(false);

    // Effect to reset score if initialScore prop changes (e.g., when viewing post details)
    useEffect(() => {
        setScore(initialScore);
    }, [initialScore]);


    // --- Logic to check the user's existing vote on mount ---
    useEffect(() => {
        // Only run if a user is logged in
        if (user) {
            // NOTE: In a real application, you would make an API call here to 
            // check the vote status for this postId and user.
            // Example API endpoint: GET /votes/status?post_id={postId}&user_id={user.id}
            
            // For now, we'll keep it simple and assume no prior vote status check is required.
            // If you implemented a /votes/status API, the logic would go here:
            // fetch(...).then(data => setUserVote(data.vote_status))...
        } else {
            setUserVote(0); // Reset vote status if user logs out
        }
    }, [user, postId]);


    // --- Vote Submission Handler ---
    const handleVote = async (voteType) => { // voteType is 1 (up) or -1 (down)
        
        if (!user) {
            alert("You must be logged in to vote.");
            return;
        }

        // Prevent rapid voting
        if (isLoading) return;
        setIsLoading(true);

        // Determine the actual vote to send (1, -1, or 0 for unvote)
        let voteValue = voteType;
        let finalScoreChange = voteType;

        // If the user clicks the same vote button they already clicked (i.e., undo the vote)
        if (userVote === voteType) {
            voteValue = 0; // Send 0 to undo the vote
            finalScoreChange = -voteType; // Score changes in the opposite direction
        } 
        // If the user is changing their vote (e.g., from +1 to -1)
        else if (userVote !== 0) {
            // Changing vote = -userVote (to undo old) + voteType (to apply new)
            finalScoreChange = -userVote + voteType; 
        }

        try {
            const response = await fetch(`${API_BASE_URL}/votes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 5. Use the user's ID obtained from context for authentication
                    'X-User-ID': user.id 
                },
                body: JSON.stringify({
                    post_id: postId,
                    // Send the final vote value (1, -1, or 0)
                    vote_value: voteValue 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit vote.');
            }

            // Success! Update local state
            const newScore = score + finalScoreChange;
            setScore(newScore);
            setUserVote(voteValue); // Set the new vote status
            
            // Propagate the change up to App.jsx to update the main feed post list
            onScoreUpdate(postId, newScore); 

        } catch (e) {
            console.error("Voting Error:", e);
            alert(`Error: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    // Helper function to disable buttons when not logged in
    const isVoteDisabled = isLoading || !user;

    // Determine button styles based on current user vote
    const upvoteClass = userVote === 1 ? 'voted' : '';
    const downvoteClass = userVote === -1 ? 'voted' : '';

    return (
        <div className="vote-controller">
            <button
                className={`upvote-btn ${upvoteClass}`}
                onClick={() => handleVote(1)}
                disabled={isVoteDisabled}
                aria-label="Upvote Post"
            >
                ▲
            </button>
            <span className="vote-score">{score}</span>
            <button
                className={`downvote-btn ${downvoteClass}`}
                onClick={() => handleVote(-1)}
                disabled={isVoteDisabled}
                aria-label="Downvote Post"
            >
                ▼
            </button>
        </div>
    );
}

export default VoteController;