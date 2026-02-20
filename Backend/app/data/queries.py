from data.db import db
from data.models import User, Product, ShoppingCart, ShoppingCartItem

# PRODUKT
def get_all_products():
    return Product.query.all()

# ANVÄNDARE
def get_user_by_email(email):
    return User.query.filter_by(email=email).first()

def get_user_by_id(user_id):
    return User.query.get(user_id)

def add_user(first_name, last_name, phone, email, password):
    user = User(
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        email=email,
        password=password,
        Admin=False
    )
    db.session.add(user)
    db.session.commit()
    return user

# KUNDVAGN
def get_cart_by_user(user_id):
    cart = ShoppingCart.query.filter_by(user_id=user_id).order_by(ShoppingCart.created_at.desc()).first()
    if not cart:
        cart = ShoppingCart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    return cart

def add_item_to_cart(cart_id, product_id, quantity):
    item = ShoppingCartItem.query.filter_by(cart_id=cart_id, product_id=product_id).first()
    if item:
        item.quantity += quantity
    else:
        new_item = ShoppingCartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
        db.session.add(new_item)
    db.session.commit()

def update_item_quantity(cart_id, product_id, quantity):
    item = ShoppingCartItem.query.filter_by(cart_id=cart_id, product_id=product_id).first()
    if item:
        if quantity <= 0:
            db.session.delete(item)
        else:
            item.quantity = quantity
        db.session.commit()

def remove_item_from_cart(cart_id, product_id):
    item = ShoppingCartItem.query.filter_by(cart_id=cart_id, product_id=product_id).first()
    if item:
        db.session.delete(item)
        db.session.commit()