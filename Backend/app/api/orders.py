from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from data.queries import (
    get_all_orders, get_order_by_id, get_orders_by_user,
    update_order_status, update_order, delete_order, get_user_by_id
)
from api.orderMail import send_ready_for_pickup_email

orders_bp = Blueprint('orders_bp', __name__)

ORDER_STATUS = {
    1: "Mottagen",
    2: "Under behandling",
    3: "Redo för upphämtning",
    4: "Levererad",
    5: "Avbruten"
}

def serialize_order(order):
    """Serialize an order object to JSON-friendly format"""
    items_data = []
    total = 0
    for item in order.items:
        item_total = float(item.list_price or 0) * item.quantity
        total += item_total
        items_data.append({
            "item_id": item.item_id,
            "product_id": item.product_id,
            "product_name": item.product.product_name if item.product else "Okänd produkt",
            "quantity": item.quantity,
            "list_price": float(item.list_price) if item.list_price else 0,
            "item_total": item_total
        })
    
    customer = order.customer
    return {
        "order_id": order.order_id,
        "order_status": order.order_status,
        "order_status_text": ORDER_STATUS.get(order.order_status, "Okänd"),
        "order_date": str(order.order_date) if order.order_date else None,
        "required_date": str(order.required_date) if order.required_date else None,
        "pickup_date": str(order.Pickup_date) if order.Pickup_date else None,
        "user_id": order.User_id,
        "customer_name": f"{customer.first_name} {customer.last_name}" if customer else "Okänd",
        "customer_email": customer.email if customer else None,
        "customer_phone": customer.phone if customer else None,
        "items": items_data,
        "total": total
    }

@orders_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    user = get_user_by_id(get_jwt_identity())
    if not user or not user.Admin:
        return jsonify({'msg': 'Endast admin kan se alla ordrar'}), 403
    
    orders = get_all_orders()
    return jsonify([serialize_order(order) for order in orders])

@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user = get_user_by_id(get_jwt_identity())
    if not user or not user.Admin:
        return jsonify({'msg': 'Endast admin kan se orderdetaljer'}), 403
    
    order = get_order_by_id(order_id)
    if not order:
        return jsonify({'msg': 'Ordern hittades inte'}), 404
    
    return jsonify(serialize_order(order))

@orders_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_status(order_id):
    user = get_user_by_id(get_jwt_identity())
    if not user or not user.Admin:
        return jsonify({'msg': 'Endast admin kan uppdatera orderstatus'}), 403
    
    data = request.get_json()
    new_status = data.get('order_status')
    
    if new_status not in ORDER_STATUS:
        return jsonify({'msg': 'Ogiltig orderstatus'}), 400
    
    order = update_order_status(order_id, new_status)
    if not order:
        return jsonify({'msg': 'Ordern hittades inte'}), 404

    if new_status == 3:
        try:
            customer = order.customer
            if customer and customer.email:
                send_ready_for_pickup_email(customer.email, order)
        except Exception as e:
            print(f"Kunde inte skicka uppföljningsmail: {e}")
    
    return jsonify({'msg': 'Orderstatus uppdaterad', 'order': serialize_order(order)})

@orders_bp.route('/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_order_route(order_id):
    user = get_user_by_id(get_jwt_identity())
    if not user or not user.Admin:
        return jsonify({'msg': 'Endast admin kan uppdatera ordrar'}), 403
    
    data = request.get_json()
    order = update_order(order_id, data)
    if not order:
        return jsonify({'msg': 'Ordern hittades inte'}), 404
    
    return jsonify({'msg': 'Order uppdaterad', 'order': serialize_order(order)})

@orders_bp.route('/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order_route(order_id):
    user = get_user_by_id(get_jwt_identity())
    if not user or not user.Admin:
        return jsonify({'msg': 'Endast admin kan ta bort ordrar'}), 403
    
    if delete_order(order_id):
        return jsonify({'msg': 'Order borttagen'})
    else:
        return jsonify({'msg': 'Ordern hittades inte'}), 404

@orders_bp.route('/my-orders', methods=['GET'])
@jwt_required()
def get_my_orders():
    user_id = get_jwt_identity()
    orders = get_orders_by_user(user_id)
    return jsonify([serialize_order(order) for order in orders])