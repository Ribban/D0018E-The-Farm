from flask import Flask
from data.db import db
from data.queries import users_bp 

app = Flask(__name__)

# Konfiguration till docker-compose.yml
DB_USER = "farm_admin"
DB_PASSWORD = "drängenelias"
DB_HOST = "localhost" # Eftersom Python lokalt, Docker port-forwardar 5432
DB_NAME = "farm_db"
DB_PORT = "5432"

# Använd psycopg2-drivrutinen för postgres
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Koppla databasen till appen
db.init_app(app)

# Registrera routes
app.register_blueprint(users_bp)

@app.route("/")
def index():
    return "Welcome to the Farm Shop API!"

if __name__ == "__main__":
    # Detta skapar tabellerna automatiskt om de inte redan finns
    with app.app_context():
        db.create_all()
        print("Tabeller kontrollerade/skapade!")
        
    app.run(debug=True)