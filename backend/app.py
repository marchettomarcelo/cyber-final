from flask import Flask, request, jsonify
from flask_cors import CORS
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, CORS_ORIGINS, SECRET_KEY
from models import db, User, TODOLIST
from functions import hash_password, generate_jwt
from decorators import token_required, jwt_required
from enums import StatusEnum
import secrets
import jwt

app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)

app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/users', methods=['POST'])
@token_required
def create_user():
    name = request.json['name']
    email = request.json['email']
    password = request.json['password']
    
    salt = secrets.token_hex(8)
    hashed_password = hash_password(password, salt)
    
    user = User(name=name, email=email, password=hashed_password, salt=salt)
    db.session.add(user)
    db.session.commit()
    return jsonify({'id': user.id, 'name': user.name, 'email': user.email})

@app.route('/login', methods=['POST'])
@token_required
def login():
    email = request.json['email']
    password = request.json['password']
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    hashed_password = hash_password(password, user.salt)
    if hashed_password == user.password:
        jwt_token = generate_jwt(user.id)
        return jsonify({'message': 'Login successful', 'jwt_token': jwt_token})
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/user-info', methods=['GET'])
@token_required
def get_user_info():
    auth_header = request.headers.get('X-Session-Token')
    if not auth_header:
        return jsonify({'error': 'X-Session-Token header missing'}), 401

    try:
        decoded = jwt.decode(auth_header, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded.get('user_id')
        return jsonify({'user_id': user_id})
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/users/<int:user_id>/tasks', methods=['POST'])
@jwt_required
def create_task(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    task = TODOLIST(
        title=request.json['title'],
        description=request.json['description'],
        user_id=user_id,
        status=StatusEnum.TODO
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({'id': task.id, 'title': task.title, 'status': task.status.value})

@app.route('/users/<int:user_id>/tasks', methods=['GET'])
@jwt_required
def get_tasks(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tasks = TODOLIST.query.filter_by(user_id=user_id).all()
    tasks = [{'id': task.id, 'title': task.title, 'description': task.description, 'status': task.status.value} for task in tasks]
    return jsonify(tasks)

@app.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required
def update_task(task_id):
    task = TODOLIST.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    if 'title' in request.json:
        task.title = request.json['title']
    if 'description' in request.json:
        task.description = request.json['description']
    if 'status' in request.json:
        try:
            task.status = StatusEnum(request.json['status'])
        except ValueError:
            return jsonify({'error': 'Invalid status value'}), 400

    db.session.commit()
    return jsonify({'id': task.id, 'title': task.title, 'status': task.status.value})

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required
def delete_task(task_id):
    task = TODOLIST.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})

if __name__ == '__main__':
    app.run(debug=True)
