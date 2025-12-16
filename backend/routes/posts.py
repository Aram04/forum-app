# backend/routes/posts.py

from flask import Blueprint, request, jsonify, session
from extensions import db
from models import Post

posts_bp = Blueprint("posts", __name__)

@posts_bp.route("/posts", methods=["GET"])
def get_posts():
    posts = Post.query.order_by(Post.id.desc()).all()
    return jsonify([
        {
            "id": p.id,
            "title": p.title,
            "body": p.body,
            "vote_score": 0,  # placeholder until aggregation
            "author_id": p.user_id,
            "author_username": p.author.username if p.author else "Anonymous"
        }
        for p in posts
    ])

@posts_bp.route("/posts", methods=["POST"])
def create_post():
    if "user_id" not in session:
        return jsonify(error="Not authenticated"), 401

    data = request.get_json()

    if not data or "title" not in data or "body" not in data:
        return jsonify(error="Missing fields"), 400

    post = Post(
        title=data["title"],
        body=data["body"],
        user_id=session["user_id"]   # ✅ CORRECT COLUMN
    )

    db.session.add(post)
    db.session.commit()

    return jsonify(
        id=post.id,
        title=post.title,
        body=post.body,
        vote_score=0,
        author_id=post.user_id,
        author_username=post.author.username
    ), 201
