from flask import Blueprint, request, jsonify, g
from extensions import db
from models import Post, Vote

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    msg = []
    for p in posts:
        data = {"id": p.id, "title": p.title, "body": p.body, "topic": p.topic,
                "created": p.created}
        votes = Vote.query.filter_by(post_id=p.id)
        total = 0
        for v in votes:
            total += v.value
        data.update({"votecount": total})
        msg.append(data)
    return jsonify(msg)

@posts_bp.route('/posts/tag/<string:tag>', methods=['GET'])
def get_tagged_posts(tag):
    posts = Post.query.filter_by(topic=tag)
    msg = []
    for p in posts:
        data = {"id": p.id, "title": p.title, "body": p.body, "topic": p.topic,
                "created": p.created}
        votes = Vote.query.filter_by(post_id=p.id)
        total = 0
        for v in votes:
            total += v.value
        data.update({"votecount": total})
        msg.append(data)
    return jsonify(msg)

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
def delete_post(id):
    post = Post.query.get(id)
    if g.level < 2 or g.user == post.user_id:
        db.session.delete(post)
        db.session.commit()
        return jsonify(message="Post deleted")

@posts_bp.route('/posts/<int:id>', methods=['PUT'])
def edit_post(id):
    data = request.json
    post = Post.query.get(id)
    if g.user == post.user_id:
        post.body = data['body']
        db.session.commit()
        return jsonify(message="Post edited")
    else:
        return jsonify(message="Not your post")
