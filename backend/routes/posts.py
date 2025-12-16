# backend/routes/posts.py

from flask import Blueprint, request, jsonify, g
from extensions import db
from models import Post

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([
        {
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "user_id": p.user_id
        }
        for p in posts
    ])

@posts_bp.route('/posts', methods=['POST'])
def create_post():
    if not g.user:
        return jsonify(error="Not authenticated"), 401

    data = request.get_json()

    if not data:
        return jsonify(error="No JSON provided"), 400

    title = data.get('title')
    content = data.get('content')

    if not title or not content:
        return jsonify(error="Missing title or content"), 400

    post = Post(
        title=title,
        content=content,
        user_id=g.user
    )

    db.session.add(post)
    db.session.commit()

    return jsonify(
        id=post.id,
        title=post.title,
        content=post.content,
        user_id=post.user_id
    ), 201
