from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from data.db import db
from data.queries import users_bp 
from data.queries import products_bp
from dotenv import load_dotenv
from api.auth import auth_bp
from datetime import timedelta
import os

app = Flask(__name__)

load_dotenv()

app.config["JWT_SECRET_KEY"] = "please-remember-to-change-me"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app) # Initiera JWT här

# Konfiguration till docker-compose.yml
user = os.getenv('DB_USER', 'elias')
password = os.getenv('DB_PASSWORD', '6969')
host = os.getenv('DB_HOST', '95.155.245.165') 
port = os.getenv('DB_PORT', '5432')
dbname = os.getenv('DB_NAME', 'farmdb')
database_url = os.getenv('DATABASE_URL')

# Använd psycopg2-drivrutinen för postgres
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Koppla databasen till appen
db.init_app(app)

# Registrera routes
app.register_blueprint(users_bp)
app.register_blueprint(products_bp)
app.register_blueprint(auth_bp)

CORS(app)

@app.route("/")
def index():
    return "Welcome to the Farm Shop API!"

if __name__ == "__main__":
    # Detta skapar tabellerna automatiskt om de inte redan finns
    with app.app_context():
        db.create_all()
        print("Tabeller kontrollerade/skapade!")
        
    app.run(debug=True, host="0.0.0.0")