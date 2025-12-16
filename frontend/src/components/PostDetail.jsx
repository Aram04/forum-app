import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteController from './VoteController';
import CommentForm from './CommentForm';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function PostDetail() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/posts/${postId}`)
            .then(res => res.json())
            .then(setPost);

        fetch(`${API_BASE_URL}/posts/${postId}/comments`)
            .then(res => res.json())
            .then(setComments);
    }, [postId]);

    const deletePost = async () => {
        await fetch(`${API_BASE_URL}/posts/${post.id}`, {
            method: "DELETE",
            credentials: "include"
        });
        navigate("/");
    };

    if (!post) return <p>Loading…</p>;

    return (
        <div className="post-detail-container">
            <VoteController
                postId={post.id}
                initialScore={post.vote_score}
                onScoreUpdate={(id, score) =>
                    setPost(prev => ({ ...prev, vote_score: score }))
                }
            />

            <h1>{post.title}</h1>
            <p>{post.body}</p>

            {/* ✅ SAFE EDIT / DELETE */}
            {user && user.id === post.author_id && (
                <div style={{ marginBottom: "15px" }}>
                    <button onClick={deletePost}>Delete</button>
                </div>
            )}

            <CommentForm postId={post.id} />
        </div>
    );
}

export default PostDetail;
