import hashlib
import jwt
import datetime
from config import SECRET_KEY

def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode()).hexdigest()

def generate_jwt(user_id):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=6)
    token = jwt.encode(
        {'user_id': user_id, 'exp': expiration},
        SECRET_KEY,
        algorithm='HS256'
    )
    return token
