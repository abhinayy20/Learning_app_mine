import jwt
from datetime import datetime, timedelta
from config import Config

def create_token(user_id):
    """Create JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(seconds=Config.JWT_EXPIRATION),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)
    return token

def verify_token(token):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
