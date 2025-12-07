import redis
import json
from config import Config

# Redis client
redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)

def cache_get(key):
    """Get cached data"""
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except Exception as e:
        print(f'Cache get error: {e}')
        return None

def cache_set(key, data, ttl=300):
    """Set cached data with TTL"""
    try:
        redis_client.setex(key, ttl, json.dumps(data))
    except Exception as e:
        print(f'Cache set error: {e}')

def cache_delete(pattern):
    """Delete cached data (supports patterns)"""
    try:
        if '*' in pattern:
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
        else:
            redis_client.delete(pattern)
    except Exception as e:
        print(f'Cache delete error: {e}')
