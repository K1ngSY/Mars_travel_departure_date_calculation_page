# app/__init__.py

from flask import Flask
from flask_cors import CORS
from app.routes import main

def create_app():
    app = Flask(__name__)
    # 配置 CORS，允许所有来源的请求访问以 /api/ 开头的路由
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(main)
    return app
