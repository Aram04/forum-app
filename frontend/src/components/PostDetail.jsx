import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import VoteController from "./VoteController";
import CommentForm from "./CommentForm";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function PostDetail({ updatePostScore }) {
    const { postId } = useParams();
    const { user } = useContext(AuthContext);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/posts/${postId}`)
            .then(r => r.json())
            .then(setPost);

        fetch(`${API_BASE_URL}/posts/${postId}/comments`)
            .then(r => r.json())
            .then(setComments);
    }, [postId]);

    const handleVoteUpdate = (id, score) => {
        setPost(p => ({ ...p, vote_score: score }));
        updatePostScore(id, score);
    };

    const handleCommentCreated = (comment) => {
        setComments(prev => [comment, ...prev]);
    };

    if (!post) return <p>Loading...</p>;

    return (
        <div className="post-detail-container">
            <VoteController
                postId={post.id}
                initialScore={post.vote_score}
                onScoreUpdate={handleVoteUpdate}
            />

            <h1>{post.title}</h1>
            <p>{post.body}</p>

            <section className="comments-section">
                {user && (
                    <CommentForm
                        postId={post.id}
                        onCommentCreated={handleCommentCreated}
                    />
                )}

                {comments.map(comment => (
                    <div key={comment.id} className="comment-card">
                        <p>{comment.body}</p>
                        <small>— {comment.author_username}</small>

                        {comment.replies.map(reply => (
                            <div key={reply.id} className="comment-reply">
                                <p>{reply.body}</p>
                                <small>— {reply.author_username}</small>
                            </div>
                        ))}
                    </div>
                ))}
            </section>
        </div>
    );
}

export default PostDetail;
