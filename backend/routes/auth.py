from flask import Blueprint, request, jsonify, session, g, redirect
from extensions import db, bcrypt
from models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], level=data['level'], password_hash=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify(message="User created")

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        session["user_id"] = user.id
        session["level"] = user.level
        return jsonify(user_id=user.id,level=user.level)
    return jsonify(error="Invalid credentials"), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect("/login")

@auth_bp.route('/checksession', methods=['GET'])
def checks():
    if "user_id" in session:
        return jsonify(session['user_id'],session['level'])
    else:
        return jsonify("not logged in")
