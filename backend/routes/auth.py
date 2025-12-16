from flask import Blueprint, request, jsonify, session, g
from extensions import db, bcrypt
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    # IMPORTANT: handle preflight
    if request.method == 'OPTIONS':
        return '', 200

    data = request.json

    # basic validation
    if not data or 'username' not in data or 'password' not in data:
        return jsonify(error="Missing username or password"), 400

    existing = User.query.filter_by(username=data['username']).first()
    if existing:
        return jsonify(error="Username already exists"), 400

    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(
        username=data['username'],
        password_hash=hashed,
        level=data.get('level', 1)
    )

    db.session.add(user)
    db.session.commit()

    # auto-login after signup
    session["user_id"] = user.id
    session["level"] = user.level

    return jsonify(
        user_id=user.id,
        username=user.username,
        level=user.level
    )

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    # IMPORTANT: handle preflight
    if request.method == 'OPTIONS':
        return '', 200

    data = request.json

    if not data or 'username' not in data or 'password' not in data:
        return jsonify(error="Missing credentials"), 400

    user = User.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        session["user_id"] = user.id
        session["level"] = user.level
        return jsonify(
            user_id=user.id,
            username=user.username,
            level=user.level
        )

    return jsonify(error="Invalid credentials"), 401

@auth_bp.route('/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':
        return '', 200

    session.clear()
    return jsonify(message="Logged out")

@auth_bp.route('/checksession', methods=['GET'])
def checks():
    if "user_id" in session:
        return jsonify(
            user_id=session["user_id"],
            level=session["level"]
        )
    return jsonify(error="not logged in"), 401
