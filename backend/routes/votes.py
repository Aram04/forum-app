from flask import Blueprint, request, jsonify
from extensions import db
from models import Vote

votes_bp = Blueprint('votes', __name__)

@votes_bp.route('/vote', methods=['POST'])
def vote():
    data = request.json

    existing = Vote.query.filter_by(
        user_id=data['user_id'],
        post_id=data['post_id']
    ).first()

    if existing:
        existing.value = data['value']
    else:
        vote = Vote(
            user_id=data['user_id'],
            post_id=data['post_id'],
            value=data['value']
        )
        db.session.add(vote)

    db.session.commit()
    return jsonify(message="Vote recorded")
