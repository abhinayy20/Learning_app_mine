from flask import Blueprint, request, jsonify
from models import User
from app import db
from services.auth_service import create_token
from services.cache_service import cache_get, cache_set, cache_delete

auth_bp = Blueprint('auth', __name__)
user_bp = Blueprint('users', __name__)
health_bp = Blueprint('health', __name__)

# ==================== AUTH ROUTES ====================

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'username', 'password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'message': f'{field} is required'
            }), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({
            'success': False,
            'message': 'Email already registered'
        }), 409
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({
            'success': False,
            'message': 'Username already taken'
        }), 409
    
    # Create new user
    user = User(
        email=data['email'],
        username=data['username'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        role=data.get('role', 'student')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = create_token(user.id)
    
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'data': {
            'user': user.to_dict(include_email=True),
            'token': token
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return token"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({
            'success': False,
            'message': 'Email and password are required'
        }), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({
            'success': False,
            'message': 'Invalid credentials'
        }), 401
    
    if not user.is_active:
        return jsonify({
            'success': False,
            'message': 'Account is inactive'
        }), 403
    
    # Generate token
    token = create_token(user.id)
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': {
            'user': user.to_dict(include_email=True),
            'token': token
        }
    })

# ==================== USER ROUTES ====================

@user_bp.route('', methods=['GET'])
def get_users():
    """Get all users with pagination"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    role = request.args.get('role')
    
    # Build query
    query = User.query.filter_by(is_active=True)
    if role:
        query = query.filter_by(role=role)
    
    # Check cache
    cache_key = f'users:{role or "all"}:{page}:{limit}'
    cached = cache_get(cache_key)
    if cached:
        return jsonify({
            'success': True,
            'cached': True,
            'data': cached
        })
    
    # Paginate
    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    
    result = {
        'users': [user.to_dict() for user in pagination.items],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': pagination.total,
            'pages': pagination.pages
        }
    }
    
    # Cache result
    cache_set(cache_key, result, ttl=300)
    
    return jsonify({
        'success': True,
        'cached': False,
        'data': result
    })

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    # Check cache
    cache_key = f'user:{user_id}'
    cached = cache_get(cache_key)
    if cached:
        return jsonify({
            'success': True,
            'cached': True,
            'data': cached
        })
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    result = user.to_dict()
    
    # Cache result
    cache_set(cache_key, result, ttl=600)
    
    return jsonify({
        'success': True,
        'cached': False,
        'data': result
    })

@user_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'role' in data:
        user.role = data['role']
    
    db.session.commit()
    
    # Invalidate cache
    cache_delete(f'user:{user_id}')
    cache_delete('users:*')
    
    return jsonify({
        'success': True,
        'message': 'User updated successfully',
        'data': user.to_dict(include_email=True)
    })

# ==================== HEALTH ROUTES ====================

@health_bp.route('', methods=['GET'])
def health():
    """Health check endpoint"""
    db_status = 'UP'
    try:
        db.session.execute(db.text('SELECT 1'))
    except Exception:
        db_status = 'DOWN'
    
    health_data = {
        'status': 'UP' if db_status == 'UP' else 'DEGRADED',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'user-service',
        'checks': {
            'database': db_status
        }
    }
    
    status_code = 200 if db_status == 'UP' else 503
    return jsonify(health_data), status_code

@health_bp.route('/ready', methods=['GET'])
def ready():
    """Readiness probe"""
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'status': 'ready'})
    except Exception:
        return jsonify({'status': 'not ready'}), 503

@health_bp.route('/live', methods=['GET'])
def live():
    """Liveness probe"""
    return jsonify({'status': 'alive'})

from datetime import datetime
