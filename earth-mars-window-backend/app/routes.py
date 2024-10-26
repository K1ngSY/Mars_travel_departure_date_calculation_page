# app/routes.py

from flask import Blueprint
from app.controllers import get_next_window_controller

main = Blueprint('main', __name__)

@main.route('/api/window/next', methods=['GET', 'POST'])
def next_window():
    return get_next_window_controller()
