# app/services.py

from app.utils import calculate_next_window

def get_next_window_service(target_date=None):
    """获取从目标日期开始的下一个发射窗口期的服务层函数。"""
    return calculate_next_window(target_date)
