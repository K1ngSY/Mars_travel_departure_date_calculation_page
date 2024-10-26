# run.py

from app import create_app
from waitress import serve

app = create_app()

if __name__ == '__main__':
    # 使用 Waitress 生产级服务器运行 Flask 应用
    serve(app, host='0.0.0.0', port=5000)
