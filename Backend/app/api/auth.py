from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from data.models import User
from data.db import db

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    if not email or not data.get('password'):
        return jsonify({'msg': 'Email and password required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already registered'}), 409
    hashed_password = generate_password_hash(data['password'])
    user = User(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        phone=data.get('phone'),
        email=email,
        password=hashed_password,
        Admin=False
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'User registered successfully'}), 201

@auth_bp.route('/token', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if user and hasattr(user, 'password') and check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.User_id))
        return jsonify(access_token=access_token)
    return jsonify({'msg': 'Bad credentials'}), 401


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    print("[DEBUG] Request headers:", dict(request.headers))
    user_id = get_jwt_identity()
    print(f"[DEBUG] user_id from JWT: {user_id}")
    user = User.query.get(user_id)
    print(f"[DEBUG] user from DB: {user}")
    if user:
        print(f"[DEBUG] user data: {user.first_name}, {user.last_name}, {user.phone}, {user.email}")
        return jsonify({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'email': user.email
        })
    print("[DEBUG] User not found for id", user_id)
    return jsonify({'msg': 'User not found'}), 404

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'msg': 'Logged out'}), 200