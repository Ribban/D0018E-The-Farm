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

# CRUD för produkter
def create_product(data):
    product = Product(
        product_name=data.get('name'),
        weight=data.get('weight'),
        Packaging_date=data.get('packaging_date'),
        list_price=data.get('list_price'),
        Animal_Age=data.get('animal_age'),
        category_id=data.get('category_id')
    )
    db.session.add(product)
    db.session.commit()
    return product

def update_product(product_id, data):
    product = Product.query.get(product_id)
    if not product:
        return None
    product.product_name = data.get('name', product.product_name)
    product.weight = data.get('weight', product.weight)
    product.Packaging_date = data.get('packaging_date', product.Packaging_date)
    product.list_price = data.get('list_price', product.list_price)
    product.Animal_Age = data.get('animal_age') if data.get('animal_age') not in ("", None) else None
    product.category_id = data.get('category_id', product.category_id)
    db.session.commit()
    return product

def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return False
    db.session.delete(product)
    db.session.commit()
    return True
from data.models import Order, OrderItem

# ORDER
def create_order_from_cart(user_id, pickup_date, payment_method):
    cart = get_cart_by_user(user_id)
    if not cart or not cart.items:
        return None
    # Skapa order
    order = Order(
        User_id=user_id,
        order_status=1,  # 1 = ny order
        order_date=db.func.current_date(),
        required_date=None,
        Pickup_date=pickup_date
    )
    db.session.add(order)
    db.session.flush()  # Få order_id
    # Skapa orderrader
    for item in cart.items:
        order_item = OrderItem(
            order_id=order.order_id,
            item_id=None,
            product_id=item.product_id,
            quantity=item.quantity,
            list_price=item.product.list_price
        )
        db.session.add(order_item)
    # Töm kundvagn
    for item in cart.items:
        db.session.delete(item)
    db.session.commit()
    return order