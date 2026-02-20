from flask import Blueprint, jsonify
from data.queries import get_all_products

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