from flask import Blueprint, request, jsonify, session
from extensions import db
from models import Vote, Post

votes_bp = Blueprint("votes", __name__)

@votes_bp.route("/vote", methods=["POST"])
def vote():
    # user must be logged in via session
    if "user_id" not in session:
        return jsonify(error="Not authenticated"), 401

    data = request.get_json()

    if not data or "post_id" not in data or "value" not in data:
        return jsonify(error="Missing vote fields"), 400

    post = Post.query.get(data["post_id"])
    if not post:
        return jsonify(error="Post does not exist"), 400

    existing = Vote.query.filter_by(
        user_id=session["user_id"],
        post_id=data["post_id"]
    ).first()

    if existing:
        existing.value = data["value"]
    else:
        vote = Vote(
            user_id=session["user_id"],
            post_id=data["post_id"],
            value=data["value"]
        )
        db.session.add(vote)

    db.session.commit()
    return jsonify(message="Vote recorded"), 200
