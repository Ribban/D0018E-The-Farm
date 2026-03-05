from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from data.queries import get_comments_for_product, get_user_comment_for_product, add_comment, update_comment, delete_comment, get_user_by_id

comments_bp = Blueprint('comments_bp', __name__)

@comments_bp.route('/products/<int:product_id>/comments', methods=['GET'])
def get_comments(product_id):
    comments = get_comments_for_product(product_id)
    result = []
    for c in comments:
        user = get_user_by_id(c.user_id)
        result.append({
            "id": c.comment_id,
            "user_id": c.user_id,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Okänd",
            "grade": c.grade,
            "text": c.text,
            "created_at": str(c.created_at)
        })
    return jsonify(result)

@comments_bp.route('/products/<int:product_id>/comments', methods=['POST'])
@jwt_required()
def post_comment(product_id):
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    data = request.get_json()
    text = data.get('text')
    grade = data.get('grade')
    if not text:
        return jsonify({'msg': 'Text required'}), 400
    existing = get_user_comment_for_product(product_id, user_id)
    if existing:
        comment = update_comment(existing.comment_id, user_id, text, grade)
        return jsonify({'msg': 'Comment updated', 'id': comment.comment_id}), 200
    else:
        comment = add_comment(product_id, user_id, text, grade)
        return jsonify({'msg': 'Comment added', 'id': comment.comment_id}), 201

@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def remove_comment(comment_id):
    user_id = get_jwt_identity()
    if delete_comment(comment_id, user_id):
        return jsonify({'msg': 'Comment deleted'})
    else:
        return jsonify({'msg': 'Comment not found or not allowed'}), 403
