from flask import Blueprint, request, jsonify
from extensions import db
from models import Comment

comments_bp = Blueprint('comments', __name__)

# Get all comments for a post
@comments_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).all()
    return jsonify([
        {
            "id": c.id,
            "body": c.body,
            "user_id": c.user_id,
            "post_id": c.post_id
        }
        for c in comments
    ])

# Create a comment
@comments_bp.route('/comments', methods=['POST'])
def create_comment():
    data = request.json
    comment = Comment(
        body=data['body'],
        user_id=data['user_id'],
        post_id=data['post_id']
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(message="Comment created")

@comments_bp.route('/comments/<int:id>', methods=['DELETE'])
def delete_comment():
    comment = Comment.query.get(id)
    if session["level"] < 2 or session['user_id'] == comment.user_id:
        db.session.delete(comment)
        db.session.commit()
        return jsonify(message="Comment deleted")
    else:
        return jsonify(message="No permission")

@comments_bp.route('/comments/<int:id>', methods=['PUT'])
def edit_comment():
    data = request.json
    post = Comment.query.get(id)
    if session['user_id'] == comment.user_id:
        comment.body = data['body']
        db.session.commit()
        return jsonify(message="Comment edited")
    else:
        return jsonify(message="Not your comment")
