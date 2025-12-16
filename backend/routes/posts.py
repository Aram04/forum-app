from flask import Blueprint, request, jsonify, session
from extensions import db
from models import Post, Vote
from sqlalchemy import func

posts_bp = Blueprint("posts", __name__)

@posts_bp.route("/posts", methods=["GET"])
def get_posts():
    posts = (
        db.session.query(
            Post,
            func.coalesce(func.sum(Vote.value), 0).label("vote_score")
        )
        .outerjoin(Vote, Vote.post_id == Post.id)
        .group_by(Post.id)
        .order_by(Post.id.desc())
        .all()
    )

    return jsonify([
        {
            "id": post.id,
            "title": post.title,
            "body": post.body,
            "vote_score": vote_score,
            "author_id": post.user_id,
            "author_username": post.author.username if post.author else "Anonymous"
        }
        for post, vote_score in posts
    ])


# ✅ POPULAR POSTS — MOST VOTES FIRST (WITH TIE-BREAKER)
@posts_bp.route("/posts/popular", methods=["GET"])
def get_popular_posts():
    posts = (
        db.session.query(
            Post,
            func.coalesce(func.sum(Vote.value), 0).label("vote_score")
        )
        .outerjoin(Vote, Vote.post_id == Post.id)
        .group_by(Post.id)
        .order_by(
            func.coalesce(func.sum(Vote.value), 0).desc(),
            Post.id.desc()   # 🔑 tie-breaker so results always show
        )
        .all()
    )

    return jsonify([
        {
            "id": post.id,
            "title": post.title,
            "body": post.body,
            "vote_score": vote_score,
            "author_id": post.user_id,
            "author_username": post.author.username if post.author else "Anonymous"
        }
        for post, vote_score in posts
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
        user_id=session["user_id"]
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


@posts_bp.route("/posts/<int:post_id>", methods=["GET"])
def get_single_post(post_id):
    result = (
        db.session.query(
            Post,
            func.coalesce(func.sum(Vote.value), 0).label("vote_score")
        )
        .outerjoin(Vote, Vote.post_id == Post.id)
        .filter(Post.id == post_id)
        .group_by(Post.id)
        .first()
    )

    if not result:
        return jsonify(error="Post not found"), 404

    post, vote_score = result

    return jsonify(
        id=post.id,
        title=post.title,
        body=post.body,
        vote_score=vote_score,
        author_id=post.user_id,
        author_username=post.author.username if post.author else "Anonymous"
    )
