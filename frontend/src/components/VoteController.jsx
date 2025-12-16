// forum-app/frontend/src/components/VoteController.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function VoteController({ postId, initialScore, onScoreUpdate }) {
    const { user } = useContext(AuthContext);

    const [score, setScore] = useState(initialScore);
    const [userVote, setUserVote] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setScore(initialScore);
    }, [initialScore]);

    const handleVote = async (voteType) => {
        if (!user) {
            alert("You must be logged in to vote.");
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        let voteValue = voteType;
        let scoreChange = voteType;

        if (userVote === voteType) {
            voteValue = 0;
            scoreChange = -voteType;
        } else if (userVote !== 0) {
            scoreChange = -userVote + voteType;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/vote`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    post_id: postId,
                    value: voteValue
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Vote failed");
            }

            setScore(score + scoreChange);
            setUserVote(voteValue);
            onScoreUpdate(postId, score + scoreChange);

        } catch (e) {
            console.error("Voting Error:", e);
            alert(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="vote-controller">
            <button onClick={() => handleVote(1)} disabled={!user || isLoading}>▲</button>
            <span>{score}</span>
            <button onClick={() => handleVote(-1)} disabled={!user || isLoading}>▼</button>
        </div>
    );
}

export default VoteController;
