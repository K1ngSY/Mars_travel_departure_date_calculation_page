# app/controllers.py

from flask import request, jsonify
from app.services import get_next_window_service

def get_next_window_controller():
    """处理获取最近发射窗口期的请求。"""
    # 获取请求参数
    target_date = request.args.get('date')
    result = get_next_window_service(target_date)
    return jsonify({'nextWindow': result})
