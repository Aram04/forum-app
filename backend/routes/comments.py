from flask import Blueprint, request, jsonify, g
from extensions import db, timediff
from models import Comment, User

comments_bp = Blueprint('comments', __name__)

# Get all comments for a post (WITH NESTED REPLIES)
@comments_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id, parent=None).all()
    result = []

    for c in comments:
        result.append({
            "id": c.id,
            "body": c.body,
            "author_id": c.user_id,
            "author_username": User.query.get(c.user_id).username,
            "post_id": c.post_id,
            "diff": timediff(c.created),
            "replies": [
                {
                    "id": r.id,
                    "body": r.body,
                    "author_id": r.user_id,
                    "author_username": User.query.get(r.user_id).username,
                    "diff": timediff(r.created)
                }
                for r in Comment.query.filter_by(parent=c.id).all()
            ]
        })

    return jsonify(result)

# Create a comment for a post (USED BY FRONTEND)
@comments_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    if g.user is None:
        return jsonify(error="Not authenticated"), 401

    data = request.get_json()
    if not data or "body" not in data:
        return jsonify(error="Missing comment body"), 400

    comment = Comment(
        body=data["body"],
        user_id=g.user,
        post_id=post_id
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify(
        id=comment.id,
        body=comment.body,
        post_id=comment.post_id,
        author_id=comment.user_id,
        author_username=User.query.get(comment.user_id).username,
        diff=timediff(comment.created),
        replies=[]
    ), 201
