import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteController from './VoteController';
import CommentForm from './CommentForm';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function PostDetail({ updatePostScore }) {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const postRes = await fetch(`${API_BASE_URL}/posts/${postId}`);
            if (!postRes.ok) return navigate('/');
            const postData = await postRes.json();
            setPost(postData);

            const commentsRes = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
            if (commentsRes.ok) setComments(await commentsRes.json());

            setLoading(false);
        };
        fetchData();
    }, [postId, navigate]);

    const deletePost = async () => {
        await fetch(`${API_BASE_URL}/posts/${post.id}`, {
            method: "DELETE",
            credentials: "include"
        });
        navigate("/");
    };

    if (loading || !post) return <p>Loading...</p>;

    return (
        <div className="post-detail-container">
            <article className="post-content-full">
                <div className="vote-and-content">
                    <VoteController
                        postId={post.id}
                        initialScore={post.vote_score}
                        onScoreUpdate={(id, score) => {
                            setPost(prev => ({ ...prev, vote_score: score }));
                            updatePostScore(id, score);
                        }}
                    />

                    <div className="post-main-area">
                        <h1>{post.title}</h1>

                        <p className="post-metadata">
                            Score: {post.vote_score} | Author: {post.author_username}
                        </p>

                        {/* ✅ ADDITIVE ONLY */}
                        {user && user.id === post.author_id && (
                            <div>
                                <button onClick={deletePost}>Delete</button>
                            </div>
                        )}

                        <hr />
                        <p className="post-body">{post.body}</p>
                    </div>
                </div>
            </article>

            <section className="comments-section">
                <h2>Comments</h2>
                {user && <CommentForm postId={post.id} />}
                <div className="comment-list">
                    {comments.map(c => (
                        <div key={c.id} className="comment-card">
                            <p className="comment-body">{c.body}</p>
                            <p className="comment-author">— {c.author_username}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default PostDetail;
