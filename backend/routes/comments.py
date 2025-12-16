from flask import Blueprint, request, jsonify, g
from extensions import db, timediff
from models import Comment, User

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
            "author_username": User.query.get(c.user_id).username if c.user_id else "Anonymous",
            "post_id": c.post_id,
            "diff": timediff(c.created),
            "replies": []
        }

        # fetch replies (but do NOT overwrite parent)
        replies = Comment.query.filter_by(parent=c.id).all()
        for r in replies:
            data["replies"].append({
                "id": r.id,
                "body": r.body,
                "author_username": User.query.get(r.user_id).username if r.user_id else "Anonymous",
                "diff": timediff(r.created)
            })

        msg.append(data)

    return jsonify(msg)

# Create a comment or reply (LEGACY / INTERNAL)
@comments_bp.route('/comments', methods=['POST'])
def create_comment():
    if g.user is None:
        return jsonify(error="Not authenticated"), 401

    data = request.json

    if not data or 'body' not in data or 'post_id' not in data:
        return jsonify(error="Missing fields"), 400

    if 'parent' not in data:
        comment = Comment(
            body=data['body'],
            user_id=g.user,
            post_id=data['post_id']
        )
    else:  # reply
        comment = Comment(
            body=data['body'],
            parent=data['parent'],
            user_id=g.user,
            post_id=data['post_id']
        )

    db.session.add(comment)
    db.session.commit()

    return jsonify(message="Comment created"), 201

# delete a comment
@comments_bp.route('/comments/<int:id>', methods=['DELETE'])
def delete_comment(id):
    comment = Comment.query.get(id)

    if not comment:
        return jsonify(error="Comment not found"), 404

    if g.level < 2 or g.user == comment.user_id:
        db.session.delete(comment)
        db.session.commit()
        return jsonify(message="Comment deleted")

    return jsonify(error="No permission"), 403

# edit a comment
@comments_bp.route('/comments/<int:id>', methods=['PUT'])
def edit_comment(id):
    if g.user is None:
        return jsonify(error="Not authenticated"), 401

    data = request.json
    comment = Comment.query.get(id)

    if not comment:
        return jsonify(error="Comment not found"), 404

    if g.user == comment.user_id:
        comment.body = data['body']
        db.session.commit()
        return jsonify(message="Comment edited")

    return jsonify(error="Not your comment"), 403

# Create a comment for a specific post (USED BY FRONTEND)
@comments_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
def create_comment_for_post(post_id):
    if g.user is None:
        return jsonify(error="Not authenticated"), 401

    data = request.get_json()

    if not data or 'body' not in data:
        return jsonify(error="Missing comment body"), 400

    comment = Comment(
        body=data['body'],
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
        diff=timediff(comment.created)
    ), 201
