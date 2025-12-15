from flask import Blueprint, request, jsonify
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

@posts_bp.route('/posts', methods=['POST'])
def create_post():
    data = request.json
    post = Post(
        title=data['title'],
        body=data['body'],
        topic=data['topic'],
        user_id=data['user_id']
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(message="Post created")
