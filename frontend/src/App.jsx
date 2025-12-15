import React, { useState, useEffect } from 'react';

// IMPORTANT: Replace this with your actual Render URL!
const API_BASE_URL = "YOUR_LIVE_RENDER_URL_HERE"; 

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch data from the live backend
    fetch(`${API_BASE_URL}/posts`)
      .then(response => {
        // Check for HTTP errors (like 404 or 500)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // 2. Set the data in state
        setPosts(data);
        setLoading(false);
      })
      .catch(e => {
        // 3. Handle any errors (network, JSON parsing, etc.)
        console.error("Could not fetch posts:", e);
        setError(e.message);
        setLoading(false);
      });
  }, []); // Empty dependency array means this runs only ONCE after initial render

  // --- RENDERING LOGIC ---

  if (loading) {
    return <h1>Loading Posts...</h1>;
  }

  if (error) {
    return <h1>Error: Could not connect to the backend! ({error})</h1>;
  }

  if (posts.length === 0) {
    return <h1>No posts found. Backend is working, but the database is empty.</h1>;
  }

  return (
    <div className="App">
      <header>
        <h1>Welcome to Mini-Reddit!</h1>
      </header>
      <section>
        <h2>Available Posts ({posts.length})</h2>
        {/* Iterate over the posts and display their titles */}
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
            <h3>{post.title}</h3>
            <p>Score: {post.vote_score || 0}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;