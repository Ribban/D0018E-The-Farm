from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from data.queries import get_cart_by_user, add_item_to_cart, update_item_quantity, remove_item_from_cart, create_order_from_cart

cart_bp = Blueprint('cart_bp', __name__)

@cart_bp.route("/cart", methods=["GET"])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart = get_cart_by_user(user_id)
    
    items_data = [{
        "product_id": item.product_id,
        "name": item.product.product_name,
        "list_price": float(item.product.list_price) if item.product.list_price else 0,
        "quantity": item.quantity
    } for item in cart.items]
        
    return jsonify({"cart_id": cart.cart_id, "items": items_data})

@cart_bp.route("/cart/add", methods=["POST"])
@jwt_required()
def add_to_cart():
    data = request.get_json()
    cart = get_cart_by_user(get_jwt_identity())
    add_item_to_cart(cart.cart_id, data.get("product_id"), data.get("quantity", 1))
    return get_cart()

@cart_bp.route("/cart/update", methods=["POST"])
@jwt_required()
def update_cart():
    data = request.get_json()
    cart = get_cart_by_user(get_jwt_identity())
    update_item_quantity(cart.cart_id, data.get("product_id"), data.get("quantity", 1))
    return get_cart()

@cart_bp.route("/cart/remove", methods=["POST"])
@jwt_required()
def remove_from_cart():
    data = request.get_json()
    cart = get_cart_by_user(get_jwt_identity())
    remove_item_from_cart(cart.cart_id, data.get("product_id"))
    return get_cart()

@cart_bp.route("/cart/checkout", methods=["POST"])
@jwt_required()
def checkout_cart():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    pickup_date = data.get("pickup_date")
    payment_method = data.get("payment_method")
    order = create_order_from_cart(user_id, pickup_date, payment_method)
    if order:
        return jsonify({"msg": "Order skapad", "order_id": order.order_id}), 201
    else:
        return jsonify({"msg": "Kundvagnen är tom eller fel inträffade"}), 400