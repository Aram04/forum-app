from flask import Flask, g, session
from flask_cors import CORS
from extensions import db, bcrypt
from routes.auth import auth_bp
from routes.posts import posts_bp
from routes.comments import comments_bp
from routes.votes import votes_bp
import os

def create_app():
    app = Flask(__name__)

    # REQUIRED FOR CROSS-SITE SESSIONS (RENDER + REACT)
    app.config.update(
        SECRET_KEY="efc40a7e-3c54-481f-85a8-22cc77c32f64",
        SESSION_COOKIE_NAME="session",
        SESSION_COOKIE_SAMESITE="None",   # REQUIRED
        SESSION_COOKIE_SECURE=True,       # REQUIRED (HTTPS)
        SESSION_COOKIE_HTTPONLY=True
    )

    # CORS CONFIG (ALLOW FRONTEND + COOKIES)
    CORS(
        app,
        supports_credentials=True,
        resources={
            r"/*": {
                "origins": [
                    "https://forum-frontend-1iwk.onrender.com",
                    "http://localhost:5173"
                ]
            }
        }
    )

    # DATABASE
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        "DATABASE_URL",
        "sqlite:///forum.db"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    bcrypt.init_app(app)

    # 🔗 ROUTES
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(comments_bp)
    app.register_blueprint(votes_bp)

    # 📦 CREATE TABLES
    with app.app_context():
        db.create_all()

    return app


app = create_app()

# 👤 LOAD USER FROM SESSION
from models import User

@app.before_request
def load_user():
    g.user = None
    g.level = None

    if "user_id" in session:
        g.user = session["user_id"]
        g.level = session["level"]
