from flask import Blueprint, request, jsonify, g
from extensions import db, timediff
from models import Comment, User, Vote
import datetime

comments_bp = Blueprint('comments', __name__)

# Get all comments for a post
@comments_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id, parent=None).all()
    msg = []
    for c in comments:
        data = {
            "id": c.id,
            "body": c.body,
            "user_id": c.user_id,
            "username": User.query.get(c.user_id).username,
            "post_id": c.post_id,
            "diff": timediff(c.created)
        }
        replies = Comment.query.filter_by(parent = c.id).all()
        for r in replies:
            data.update({
                "id": r.id,
                "body": r.body,
                "username": r.username,
                "diff": timediff(r.created)
            })
        msg.append(data)
    return jsonify(msg)

# Create a comment or reply
@comments_bp.route('/comments', methods=['POST'])
def create_comment():
    data = request.json
    if 'parent' not in data:
        comment = Comment(
            body=data['body'],
            user_id=g.user,
            post_id=data['post_id']
        )
    else:#reply
        comment = Comment(
            body=data['body'],
            parent=data['parent'],
            user_id=g.user,
            post_id=data['post_id']
        )
    db.session.add(comment)
    db.session.commit()
    return jsonify(message="Comment created")

#delete a comment
@comments_bp.route('/comments/<int:id>', methods=['DELETE'])
def delete_comment(id):
    comment = Comment.query.get(id)
    if g.level < 2 or g.user == comment.user_id:
        db.session.delete(comment)
        db.session.commit()
        return jsonify(message="Comment deleted")
    else:
        return jsonify(message="No permission")

#edit a comment
@comments_bp.route('/comments/<int:id>', methods=['PUT'])
def edit_comment(id):
    data = request.json
    comment = Comment.query.get(id)
    if g.user == comment.user_id:
        comment.body = data['body']
        db.session.commit()
        return jsonify(message="Comment edited")
    else:
        return jsonify(message="Not your comment")
