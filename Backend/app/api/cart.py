from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from data.db import db
from data.models import User, Product
from sqlalchemy import text

cart_bp = Blueprint('cart_bp', __name__)

def get_user():
    user_id = get_jwt_identity()
    if not user_id:
        return None
    user = User.query.filter_by(User_id=user_id).first()
    return user

@cart_bp.route("/cart", methods=["GET"])
@jwt_required()
def get_cart():
    user = get_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    result = db.session.execute(
        text("SELECT cart_id FROM shopping_cart WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
        {"uid": user.User_id}
    ).fetchone()
    if not result:
        db.session.execute(
            text("INSERT INTO shopping_cart (user_id) VALUES (:uid)"),
            {"uid": user.User_id}
        )
        db.session.commit()
        result = db.session.execute(
            text("SELECT cart_id FROM shopping_cart WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
            {"uid": user.User_id}
        ).fetchone()
    cart_id = result[0]
    items = db.session.execute(
        text("""
        SELECT sci.product_id, p.product_name as name, p.list_price, sci.quantity
        FROM shopping_cart_items sci
        JOIN products p ON sci.product_id = p.product_id
        WHERE sci.cart_id = :cart_id
        """),
        {"cart_id": cart_id}
    ).fetchall()
    return jsonify({"cart_id": cart_id, "items": [dict(row._mapping) for row in items]})

@cart_bp.route("/cart/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    user = get_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    result = db.session.execute(
        text("SELECT cart_id FROM shopping_cart WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
        {"uid": user.User_id}
    ).fetchone()
    if not result:
        db.session.execute(
            text("INSERT INTO shopping_cart (user_id) VALUES (:uid)"),
            {"uid": user.User_id}
        )
        db.session.commit()
        result = db.session.execute(
            text("SELECT cart_id FROM shopping_cart WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
            {"uid": user.User_id}
        ).fetchone()
    cart_id = result[0]
    item = db.session.execute(
        text("SELECT quantity FROM shopping_cart_items WHERE cart_id = :cart_id AND product_id = :pid"),
        {"cart_id": cart_id, "pid": product_id}
    ).fetchone()
    if item:
        db.session.execute(
            text("UPDATE shopping_cart_items SET quantity = quantity + :q WHERE cart_id = :cart_id AND product_id = :pid"),
            {"q": quantity, "cart_id": cart_id, "pid": product_id}
        )
    else:
        db.session.execute(
            text("INSERT INTO shopping_cart_items (cart_id, product_id, quantity) VALUES (:cart_id, :pid, :q)"),
            {"cart_id": cart_id, "pid": product_id, "q": quantity}
        )
    db.session.commit()
    return get_cart()

@cart_bp.route("/cart/update", methods=["POST"])
@jwt_required()
def update_cart():
    user = get_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    result = db.session.execute(
        text("SELECT cart_id FROM shopping_cart WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
        {"uid": user.User_id}
    ).fetchone()
    if not result:
        return jsonify({"msg": "Cart not found"}), 404
    cart_id = result[0]
    if quantity <= 0:
        db.session.execute(
            text("DELETE FROM shopping_cart_items WHERE cart_id = :cart_id AND product_id = :pid"),
            {"cart_id": cart_id, "pid": product_id}
        )
    else:
        db.session.execute(
            text("UPDATE shopping_cart_items SET quantity = :q WHERE cart_id = :cart_id AND product_id = :pid"),
            {"q": quantity, "cart_id": cart_id, "pid": product_id}
        )
    db.session.commit()
    return get_cart()

@cart_bp.route("/cart/remove", methods=["POST"])
@jwt_required()
def remove_from_cart():
    user = get_user()
    if not user:
        return jsonify({"msg": "Unauthorized"}), 401
    data = request.get_json()
    product_id = data.get("product_id")
    result = db.session.execute(
        text("SELECT cart_id FROM shopping_cart WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
        {"uid": user.User_id}
    ).fetchone()
    if not result:
        return jsonify({"msg": "Cart not found"}), 404
    cart_id = result[0]
    db.session.execute(
        text("DELETE FROM shopping_cart_items WHERE cart_id = :cart_id AND product_id = :pid"),
        {"cart_id": cart_id, "pid": product_id}
    )
    db.session.commit()
    return get_cart()