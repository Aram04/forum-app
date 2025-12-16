# backend/routes/posts.py

from flask import Blueprint, request, jsonify, g
from extensions import db
from models import Post, User

posts_bp = Blueprint("posts", __name__)

@posts_bp.route("/posts", methods=["POST"])
def create_post():
    if not g.user:
        return jsonify(error="Not authenticated"), 401

    data = request.get_json()

    if not data or "title" not in data or "body" not in data:
        return jsonify(error="Missing post fields"), 400

    post = Post(
        title=data["title"],
        body=data["body"],
        author_id=g.user
    )

    db.session.add(post)
    db.session.commit()

    author = User.query.get(g.user)

    return jsonify({
        "id": post.id,
        "title": post.title,
        "body": post.body,
        "vote_score": 0,
        "author_username": author.username
    }), 201
