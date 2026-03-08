from data.db import db
from data.models import User, Product, ShoppingCart, ShoppingCartItem, Comment, Order, OrderItem

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

def get_comments_for_product(product_id):
    return Comment.query.filter_by(product_id=product_id).order_by(Comment.created_at.desc()).all()

def get_user_comment_for_product(product_id, user_id):
    return Comment.query.filter_by(product_id=product_id, user_id=int(user_id)).first()

def add_comment(product_id, user_id, text, grade=None):
    comment = Comment(
        product_id=product_id,
        user_id=int(user_id),
        text=text,
        grade=grade
    )
    db.session.add(comment)
    db.session.commit()
    return comment

def update_comment(comment_id, user_id, text, grade=None):
    comment = Comment.query.filter_by(comment_id=comment_id, user_id=int(user_id)).first()
    if comment:
        comment.text = text
        comment.grade = grade
        db.session.commit()
        return comment
    return None

def delete_comment(comment_id, user_id):
    comment = Comment.query.get(comment_id)
    if comment and comment.user_id == int(user_id):
        db.session.delete(comment)
        db.session.commit()
        return True
    return False

# CRUD för produkter
def create_product(data):
    animal_age = data.get('animal_age')
    product = Product(
        product_name=data.get('name'),
        weight=data.get('weight'),
        Packaging_date=data.get('packaging_date'),
        list_price=data.get('list_price'),
        Animal_Age=animal_age if animal_age not in ("", None) else None,
        category_id=data.get('category_id'),
        stock = data.get('stock', product.stock)
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
    product.image_url = data.get('image_url', product.image_url)
    product.stock = data.get('stock', product.stock)

    db.session.commit()
    return product

def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return False
    db.session.delete(product)
    db.session.commit()
    return True

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

def create_order_from_cart(user_id, pickup_date, payment_method):
    cart = get_cart_by_user(user_id)
    if not cart or not cart.items:
        return None
    order = Order(
        User_id=user_id,
        order_status=1,
        order_date=db.func.current_date(),
        required_date=None,
        Pickup_date=pickup_date
    )
    db.session.add(order)
    db.session.flush()

    for item in cart.items:
        if item.product.stock < item.quantity:
            db.session.rollback()
            return None
        item.product.stock -= item.quantity
        order_item = OrderItem(
            order_id=order.order_id,
            item_id=None,
            product_id=item.product_id,
            quantity=item.quantity,
            list_price=item.product.list_price
        )
        db.session.add(order_item)

    for item in cart.items:
        db.session.delete(item)
    db.session.commit()
    return order

# ORDER MANAGEMENT (Admin)
def get_all_orders():
    return Order.query.order_by(Order.order_date.desc()).all()

def get_order_by_id(order_id):
    return Order.query.get(order_id)

def get_orders_by_user(user_id):
    return Order.query.filter_by(User_id=user_id).order_by(Order.order_date.desc()).all()

def update_order_status(order_id, new_status):
    order = Order.query.get(order_id)
    if not order:
        return None
    order.order_status = new_status
    db.session.commit()
    return order

def update_order(order_id, data):
    order = Order.query.get(order_id)
    if not order:
        return None
    if 'order_status' in data:
        order.order_status = data['order_status']
    if 'required_date' in data:
        order.required_date = data['required_date']
    if 'pickup_date' in data:
        order.Pickup_date = data['pickup_date']
    db.session.commit()
    return order

def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return False
    # Delete order items first
    OrderItem.query.filter_by(order_id=order_id).delete()
    db.session.delete(order)
    db.session.commit()
    return True