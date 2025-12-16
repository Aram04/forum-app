import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import VoteController from "./VoteController";

const API_BASE_URL = "https://forum-app-3nb5.onrender.com";

function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${user.id}/posts`, {
          credentials: "include"
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch user posts");
        }

        const data = await res.json();
        setPosts(data);
      } catch (e) {
        console.error("Profile fetch error:", e);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user, navigate]);

  if (!user) return null;
  if (loading) return <p>Loading profile…</p>;

  return (
    <section className="main-feed-section">
      <h2>My Profile</h2>

      <div className="profile-card">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Level:</strong> {user.level}</p>
      </div>

      <h3>My Posts</h3>

      {posts.length === 0 && <p>You haven’t posted anything yet.</p>}

      {posts.map(post => (
        <div key={post.id} className="post-card-wrapper">
          <VoteController
            postId={post.id}
            initialScore={post.vote_score}
            onScoreUpdate={() => {}}
          />

          <div className="post-content">
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Profile;
