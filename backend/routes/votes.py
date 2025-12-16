from flask import Blueprint, request, jsonify
from extensions import db
from models import Vote, User  # ✅ import User

votes_bp = Blueprint('votes', __name__)

@votes_bp.route('/vote', methods=['POST'])
def vote():
    data = request.get_json()

    if not data:
        return jsonify(error="No JSON provided"), 400

    user_id = data.get('user_id')
    post_id = data.get('post_id')
    value = data.get('value')

    if user_id is None or post_id is None or value is None:
        return jsonify(error="Missing vote fields"), 400

    # Ensure user exists before voting
    user = User.query.get(user_id)
    if not user:
        return jsonify(error="User does not exist"), 400

    existing_vote = Vote.query.filter_by(
        user_id=user_id,
        post_id=post_id
    ).first()

    if existing_vote:
        existing_vote.value = value
    else:
        vote = Vote(
            user_id=user_id,
            post_id=post_id,
            value=value
        )
        db.session.add(vote)

    db.session.commit()
    return jsonify(message="Vote recorded"), 200


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
