from data.db import db
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = 'User'
    
    User_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    phone = db.Column(db.String)
    email = db.Column(db.String)
    password = db.Column(db.String)
    Admin = db.Column(db.Boolean)
    
    orders = db.relationship('Order', backref='customer')

class Category(db.Model):
    
    __tablename__ = 'categories'
    
    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String)

class Product(db.Model):
   
    __tablename__ = 'products'
    
    product_id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String)
    weight = db.Column(db.Numeric(10, 2))
    Packaging_date = db.Column(db.DATE)
    list_price = db.Column(db.Numeric(10, 2))
    Animal_Age = db.Column(db.SmallInteger)
    
    # Foreign Key [cite: 8]
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'))

class Order(db.Model):
    
    __tablename__ = 'orders'
    
    order_id = db.Column(db.Integer, primary_key=True)
    order_status = db.Column(db.SmallInteger)
    order_date = db.Column(db.Date)
    required_date = db.Column(db.Date)
    Pickup_date = db.Column(db.Date)
    
    items = db.relationship('OrderItem', backref='order', lazy=True)
    # Foreign Key [cite: 7]
    User_id = db.Column(db.Integer, db.ForeignKey('User.User_id'))

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'))
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'))
    quantity = db.Column(db.Integer)
    list_price = db.Column(db.Numeric(10, 2))

    product = db.relationship('Product', lazy=True)

class ShoppingCart(db.Model):
    __tablename__ = 'shopping_cart'
    
    cart_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.User_id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    items = db.relationship('ShoppingCartItem', backref='cart', lazy=True, cascade="all, delete-orphan")


class ShoppingCartItem(db.Model):
    __tablename__ = 'shopping_cart_items'
    
    cart_id = db.Column(db.Integer, db.ForeignKey('shopping_cart.cart_id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    product = db.relationship('Product')

class Comment(db.Model):
    __tablename__ = 'comments'
    comment_id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('User.User_id'), nullable=False)
    grade = db.Column(db.Integer, nullable=True)  # 1-5
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    product = db.relationship('Product', backref='comments')
    user = db.relationship('User')