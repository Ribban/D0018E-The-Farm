from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from data.queries import get_user_by_email, get_user_by_id, add_user 

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'msg': 'Logged out'}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    if not email or not data.get('password'):
        return jsonify({'msg': 'Email and password required'}), 400
    
    if get_user_by_email(email): 
        return jsonify({'msg': 'Email already registered'}), 409
    
    hashed_password = generate_password_hash(data['password'])
    add_user(data.get('first_name'), data.get('last_name'), data.get('phone'), email, hashed_password)
    
    return jsonify({'msg': 'User registered successfully'}), 201

@auth_bp.route('/token', methods=['POST'])
def login():
    data = request.get_json()
    user = get_user_by_email(data.get('email')) 
    
    if user and hasattr(user, 'password') and check_password_hash(user.password, data.get('password')):
        access_token = create_access_token(identity=str(user.User_id))
        return jsonify(access_token=access_token)
    return jsonify({'msg': 'Bad credentials'}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user = get_user_by_id(get_jwt_identity()) 
    if user:
        return jsonify({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'email': user.email
        })
    return jsonify({'msg': 'User not found'}), 404