// forum-app/frontend/src/components/VoteController.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Render URL!
const API_BASE_URL = "https://forum-app-3nb5.onrender.com"; 

function VoteController({ postId, initialScore, onScoreUpdate }) {
    const { user } = useContext(AuthContext); 

    const [score, setScore] = useState(initialScore);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setScore(initialScore);
    }, [initialScore]);

    const handleVote = async (voteValue) => {
        if (!user || isLoading) return;

        setIsLoading(true);

        try {
            // submit vote
            await fetch(`${API_BASE_URL}/vote`, {
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

            // refetch updated post score
            const res = await fetch(`${API_BASE_URL}/posts/${postId}`);
            const data = await res.json();

            setScore(data.vote_score);
            onScoreUpdate(postId, data.vote_score);

        } catch (e) {
            console.error("Voting Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="vote-controller">
            <button
                className="vote-button upvote"
                onClick={() => handleVote(1)}
                disabled={!user || isLoading}
            >
                ▲
            </button>

            <span className="vote-score">{score}</span>

            <button
                className="vote-button downvote"
                onClick={() => handleVote(-1)}
                disabled={!user || isLoading}
            >
                ▼
            </button>
        </div>
    );
}

export default VoteController;
