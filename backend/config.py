import os
from dotenv import load_dotenv

load_dotenv()

API_TOKEN = os.getenv('API_TOKEN')
SECRET_KEY = os.getenv('SECRET_KEY', 'mysecret')
SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False
CORS_ORIGINS = ["http://localhost:3000"]
