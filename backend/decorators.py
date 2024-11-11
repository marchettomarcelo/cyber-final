from functools import wraps
from flask import request, jsonify
import jwt
from config import API_TOKEN, SECRET_KEY

def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'API token missing'}), 401

        api_token = auth_header.split(" ")[1]
        if api_token != API_TOKEN:
            return jsonify({'error': 'Invalid API token'}), 401

        return func(*args, **kwargs)
    return wrapper

def jwt_required(func):
    @token_required
    @wraps(func)
    def wrapper(*args, **kwargs):
        jwt_header = request.headers.get('X-Session-Token')
        if not jwt_header:
            return jsonify({'error': 'JWT token missing'}), 401

        try:
            decoded = jwt.decode(jwt_header, SECRET_KEY, algorithms=['HS256'])
            request.user_id = decoded['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'JWT token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid JWT token'}), 401

        return func(*args, **kwargs)
    return wrapper
