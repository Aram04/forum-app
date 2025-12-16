# backend/routes/votes.py

from flask import Blueprint, request, jsonify, g
from extensions import db
from models import Vote, Post

votes_bp = Blueprint('votes', __name__)

@votes_bp.route('/vote', methods=['POST'])
def vote():
    if not g.user:
        return jsonify(error="Not authenticated"), 401

    data = request.get_json()

    if not data:
        return jsonify(error="No JSON provided"), 400

    post_id = data.get('post_id')
    value = data.get('value')

    if post_id is None or value is None:
        return jsonify(error="Missing vote fields"), 400

    post = Post.query.get(post_id)
    if not post:
        return jsonify(error="Post does not exist"), 400

    existing = Vote.query.filter_by(
        user_id=g.user,
        post_id=post_id
    ).first()

    if existing:
        existing.value = value
    else:
        vote = Vote(
            user_id=g.user,
            post_id=post_id,
            value=value
        )
        db.session.add(vote)

    db.session.commit()
    return jsonify(message="Vote recorded"), 200
