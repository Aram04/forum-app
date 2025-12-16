from flask import Blueprint, request, jsonify, g
from extensions import db
from models import Post

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([
        {"id": p.id, "title": p.title, "body": p.body, "topic": p.topic}
        for p in posts
    ])

@posts_bp.route('/posts/<string:tag>', methods=['GET'])
def get_tagged_posts():
    posts = Post.query.filter_by(
        topic=tag
    )
    return jsonify([
        {"id": p.id, "title": p.title, "body": p.body, "topic": p.topic}
        for p in posts
    ])

@posts_bp.route('/posts', methods=['POST'])
def create_post():
    data = request.json
    post = Post(
        title=data['title'],
        body=data['body'],
        topic=data['topic'],
        user_id=g.user
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(message="Post created")

@posts_bp.route('/posts/<int:id>', methods=['DELETE'])
def delete_post():
    post = Post.query.get(id)
    if g.level < 2 or g.user == post.user_id:
        db.session.delete(post)
        db.session.commit()
        return jsonify(message="Post deleted")

@posts_bp.route('/posts/<int:id>', methods=['PUT'])
def edit_post():
    data = request.json
    post = Post.query.get(id)
    if g.user == post.user_id:
        post.body = data['body']
        db.session.commit()
        return jsonify(message="Post edited")
    else:
        return jsonify(message="Not your post")
