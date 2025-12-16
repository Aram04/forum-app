from flask import Blueprint, request, jsonify
from extensions import db
from models import Vote

votes_bp = Blueprint('votes', __name__)

@votes_bp.route('/vote', methods=['POST'])
def vote():
    data = request.json

    user_id = data.get('user_id')
    post_id = data.get('post_id')
    value = data.get('value')

    if user_id is None or post_id is None or value is None:
        return jsonify(error="Missing vote data"), 400

    existing = Vote.query.filter_by(
        user_id=user_id,
        post_id=post_id
    ).first()

    if existing:
        existing.value = value
    else:
        vote = Vote(
            user_id=user_id,
            post_id=post_id,
            value=value
        )
        db.session.add(vote)

    db.session.commit()
    return jsonify(message="Vote recorded")
