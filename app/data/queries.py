
from flask import Blueprint, request, jsonify
from data.db import db
from data.models import User

# Skapa en Blueprint
users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['POST'])
def create_user():
    data = request.json
    #  fälten från schema [cite: 1]
    new_user = User(
        User_id=data.get('id'), 
        first_name=data.get('first_name'),
        email=data.get('email'),
        Admin=False
    )
    db.session.add(new_user)
    db.session.commit()
    return f"User {new_user.first_name} created successfully!"

@users_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    
    return jsonify([{
        'id': user.User_id, 
        'name': user.first_name, 
        'email': user.email
    } for user in users])