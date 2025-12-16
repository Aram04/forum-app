import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function VoteController({ postId, initialScore, onScoreUpdate }) {
    const { user } = useContext(AuthContext);
    const [score, setScore] = useState(initialScore);
    const [loading, setLoading] = useState(false);

    const vote = async (value) => {
        if (!user) return alert("Log in to vote");

        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ post_id: postId, value })
        });

        const data = await res.json();
        if (res.ok) {
            setScore(s => s + value);
            onScoreUpdate(postId, score + value);
        } else {
            alert(data.error);
        }

        setLoading(false);
    };

    return (
        <div className="vote-controller">
            <button onClick={() => vote(1)} disabled={loading}>▲</button>
            <span>{score}</span>
            <button onClick={() => vote(-1)} disabled={loading}>▼</button>
        </div>
    );
}

export default VoteController;
