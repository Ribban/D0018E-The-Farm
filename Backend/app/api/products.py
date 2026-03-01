
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from data.queries import get_all_products, create_product, update_product, delete_product, get_user_by_id

products_bp = Blueprint('products_bp', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    products = get_all_products()
    result = []
    for p in products:
        result.append({
            "id": p.product_id,
            "name": p.product_name,
            "weight": float(p.weight) if p.weight else None,
            "packaging_date": str(p.Packaging_date),
            "list_price": float(p.list_price) if p.list_price else None,
            "animal_age": p.Animal_Age,
            "category_id": p.category_id
        })
    return jsonify(result)

# Skapa produkt (admin)
@products_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product_route():
    user = get_user_by_id(get_jwt_identity())
    if not user or not user.Admin:
        return jsonify({'msg': 'Endast admin kan skapa produkter'}), 403
    data = request.get_json()
    product = create_product(data)
    return jsonify({'msg': 'Produkt skapad', 'id': product.product_id}), 201

# Uppdatera produkt (admin)
@products_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product_route(product_id):
    user = get_user_by_id(get_jwt_identity())
    if not user or not user.Admin:
        return jsonify({'msg': 'Endast admin kan uppdatera produkter'}), 403
    data = request.get_json()
    product = update_product(product_id, data)
    if not product:
        return jsonify({'msg': 'Produkten hittades inte'}), 404
    return jsonify({'msg': 'Produkt uppdaterad'})

# Ta bort produkt (admin)
@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product_route(product_id):
    user = get_user_by_id(get_jwt_identity())
    if not user or not user.Admin:
        return jsonify({'msg': 'Endast admin kan ta bort produkter'}), 403
    if delete_product(product_id):
        return jsonify({'msg': 'Produkt borttagen'})
    else:
        return jsonify({'msg': 'Produkten hittades inte'}), 404