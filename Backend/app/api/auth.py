from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from data.queries import get_user_by_email, get_user_by_id, add_user, get_all_users, update_user, delete_user 

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
            'User_id': user.User_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'email': user.email,
            'Admin': user.Admin
        })
    return jsonify({'msg': 'User not found'}), 404

# Uppdatera egen profil
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Förhindra att användaren ändrar Admin-status själv
    if 'Admin' in data:
        del data['Admin']
    
    user = update_user(user_id, data)
    if not user:
        return jsonify({'msg': 'Användaren hittades inte'}), 404
    
    return jsonify({
        'msg': 'Profil uppdaterad',
        'user': {
            'User_id': user.User_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'email': user.email
        }
    })

# Admin: Hämta alla användare
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    admin = get_user_by_id(get_jwt_identity())
    if not admin or not admin.Admin:
        return jsonify({'msg': 'Endast admin kan se användare'}), 403
    
    users = get_all_users()
    return jsonify([{
        'User_id': u.User_id,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'phone': u.phone,
        'email': u.email,
        'Admin': u.Admin
    } for u in users])

# Admin: Hämta en användare
@auth_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_single_user(user_id):
    admin = get_user_by_id(get_jwt_identity())
    if not admin or not admin.Admin:
        return jsonify({'msg': 'Endast admin kan se användare'}), 403
    
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'msg': 'Användaren hittades inte'}), 404
    
    return jsonify({
        'User_id': user.User_id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'email': user.email,
        'Admin': user.Admin
    })

# Admin: Uppdatera användare
@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_route(user_id):
    admin = get_user_by_id(get_jwt_identity())
    if not admin or not admin.Admin:
        return jsonify({'msg': 'Endast admin kan uppdatera användare'}), 403
    
    data = request.get_json()
    user = update_user(user_id, data)
    if not user:
        return jsonify({'msg': 'Användaren hittades inte'}), 404
    
    return jsonify({'msg': 'Användare uppdaterad'})

# Admin: Ta bort användare
@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user_route(user_id):
    admin = get_user_by_id(get_jwt_identity())
    if not admin or not admin.Admin:
        return jsonify({'msg': 'Endast admin kan ta bort användare'}), 403
    
    # Förhindra att admin tar bort sig själv
    if str(user_id) == str(get_jwt_identity()):
        return jsonify({'msg': 'Du kan inte ta bort dig själv'}), 400
    
    if delete_user(user_id):
        return jsonify({'msg': 'Användare borttagen'})
    return jsonify({'msg': 'Användaren hittades inte'}), 404