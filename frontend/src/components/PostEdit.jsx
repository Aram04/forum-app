import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function PostEdit() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                credentials: "include"
            });

            if (!res.ok) return navigate("/");

            const data = await res.json();

            if (!user || user.id !== data.author_id) {
                return navigate("/");
            }

            setTitle(data.title);
            setBody(data.body);
            setLoading(false);
        };

        fetchPost();
    }, [postId, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ title, body })
        });

        navigate(`/post/${postId}`);
    };

    if (loading) return <p>Loading…</p>;

    return (
        <section className="main-feed-section">
            <h2>Edit Post</h2>

            <form onSubmit={handleSubmit} className="post-form">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows="5"
                    required
                />

                <button type="submit">Save Changes</button>
            </form>
        </section>
    );
}

export default PostEdit;
