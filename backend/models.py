from flask_sqlalchemy import SQLAlchemy
from enums import StatusEnum

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(64), nullable=False)
    salt = db.Column(db.String(16), nullable=False)

    def __repr__(self):
        return f'<User {self.name}>'

class TODOLIST(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(150), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.Enum(StatusEnum), nullable=False, default=StatusEnum.TODO)

    def __repr__(self):
        return f'<TODOLIST {self.title}>'
