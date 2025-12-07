from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from prometheus_flask_exporter import PrometheusMetrics
from config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Prometheus metrics
    metrics = PrometheusMetrics(app)
    metrics.info('user_service', 'User Service for Learning Platform', version='1.0.0')
    
    # Register blueprints
    from routes import auth_bp, user_bp, health_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(health_bp, url_prefix='/health')
    
    # Root route
    @app.route('/')
    def index():
        return {
            'service': 'User Service',
            'version': '1.0.0',
            'status': 'running'
        }
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=Config.PORT)
