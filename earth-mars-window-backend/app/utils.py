# app/utils.py
'''
from skyfield.api import Loader, utc
from datetime import datetime, timedelta
import numpy as np
from multiprocessing import Pool, cpu_count

# 全局变量（在子进程中可能无法共享，需要权衡）
load = Loader('./skyfield_data')
ts = load.timescale()
planets = load('de421.bsp')
earth = planets['earth']
mars = planets['mars']
sun = planets['sun']

def calculate_phase_angle(day):
    # 使用全局变量（在子进程中需要重新加载）
    global ts, earth, mars, sun

    # 固定起始日期
    start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=utc)
    future_datetime = start_date + timedelta(days=day)
    t_future = ts.utc(future_datetime)

    # 获取地球和火星相对于太阳的位置
    earth_position = sun.at(t_future).observe(earth).apparent()
    mars_position = sun.at(t_future).observe(mars).apparent()

    # 获取黄经
    earth_lon, _, _ = earth_position.ecliptic_latlon()
    mars_lon, _, _ = mars_position.ecliptic_latlon()

    # 提取黄经（角度）
    earth_lon_deg = earth_lon.degrees % 360
    mars_lon_deg = mars_lon.degrees % 360

    # 计算相位角
    phase_angle = (mars_lon_deg - earth_lon_deg) % 360

    return (day, future_datetime.date(), phase_angle)

def calculate_next_window():
    # 定义搜索参数
    days_to_search = 1000
    step_days = 0.05
    optimal_angle = 44
    angle_tolerance = 1.5

    # 生成待计算的天数列表
    days_list = np.arange(0, days_to_search, step_days)

    # 使用多进程池并行计算
    with Pool(processes=cpu_count()) as pool:
        results = pool.map(calculate_phase_angle, days_list)

    # 遍历结果，寻找符合条件的日期
    for day, date, phase_angle in results:
        if abs(phase_angle - optimal_angle) <= angle_tolerance:
            return date.strftime('%Y-%m-%d')

    return f"在未来 {days_to_search} 天内未找到发射窗口期。"
'''
'''
# app/utils.py

from skyfield.api import Loader, utc
from datetime import datetime, timedelta
import numpy as np
import warnings

def calculate_next_window():
    # 指定缓存目录
    load = Loader('./skyfield_data')
    ts = load.timescale()
    # 使用不同的星历文件
    planets = load('de421.bsp')  # 或者 'de432s.bsp'
    earth = planets['earth']
    mars = planets['mars']
    sun = planets['sun']

    # 定义搜索参数
    days_to_search = 1000
    step_days = 0.1  # 步长
    optimal_angle = 44
    angle_tolerance = 2

    # 固定起始日期
    start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=utc)

    # 开始搜索
    for day in np.arange(0, days_to_search, step_days):
        try:
            future_datetime = start_date + timedelta(days=day)
            t_future = ts.utc(future_datetime)

            with warnings.catch_warnings():
                warnings.filterwarnings('error')
                # 获取地球和火星相对于太阳的位置
                earth_position = sun.at(t_future).observe(earth).apparent()
                mars_position = sun.at(t_future).observe(mars).apparent()

                # 获取黄经
                earth_lon, _, _ = earth_position.ecliptic_latlon()
                mars_lon, _, _ = mars_position.ecliptic_latlon()

                # 提取黄经（角度）
                earth_lon_deg = earth_lon.degrees % 360
                mars_lon_deg = mars_lon.degrees % 360

                # 计算相位角
                phase_angle = (mars_lon_deg - earth_lon_deg) % 360

            # 检查相位角是否在最佳范围内
            if abs(phase_angle - optimal_angle) <= angle_tolerance:
                next_window_date = future_datetime.date()
                print(f"Found launch window on: {next_window_date}")
                return next_window_date.strftime('%Y-%m-%d')

        except Warning as e:
            print(f"Warning on day {day}: {e}")
            continue  # 跳过当前迭代

        except Exception as e:
            print(f"Error on day {day}: {e}")
            continue

    return f"在未来 {days_to_search} 天内未找到发射窗口期。"
'''
# app/utils.py

from skyfield.api import Loader, utc
from datetime import datetime, timedelta
import numpy as np
import warnings
import logging
from multiprocessing import Pool, cpu_count

# 配置日志系统
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

def initialize_skyfield():
    """初始化 Skyfield 数据，返回时间尺度和天体对象。"""
    # 指定缓存目录
    load = Loader('./skyfield_data')
    ts = load.timescale()
    # 加载星历文件
    planets = load('de421.bsp')  # 可替换为 'de432s.bsp' 或 'de430.bsp' 以提高精度
    earth = planets['earth']
    mars = planets['mars']
    sun = planets['sun']
    return ts, earth, mars, sun

def calculate_phase_angle(args):
    """计算指定日期的相位角，返回计算结果或 None（发生异常时）。"""
    day, start_date = args
    try:
        # 初始化 Skyfield 数据
        ts, earth, mars, sun = initialize_skyfield()

        future_datetime = start_date + timedelta(days=day)
        t_future = ts.utc(future_datetime)

        with warnings.catch_warnings():
            warnings.filterwarnings('error')
            # 获取地球和火星相对于太阳的位置
            earth_position = sun.at(t_future).observe(earth).apparent()
            mars_position = sun.at(t_future).observe(mars).apparent()

            # 获取黄经
            earth_lon, _, _ = earth_position.ecliptic_latlon()
            mars_lon, _, _ = mars_position.ecliptic_latlon()

            # 提取黄经（角度）
            earth_lon_deg = earth_lon.degrees % 360
            mars_lon_deg = mars_lon.degrees % 360

            # 计算相位角
            phase_angle = (mars_lon_deg - earth_lon_deg) % 360

        logging.debug(f"Day offset {day:.2f}: Phase angle = {phase_angle:.2f}°")

        return (day, future_datetime.date(), phase_angle)

    except Warning as e:
        logging.warning(f"Warning on day offset {day:.2f}: {e}")
        return None

    except Exception as e:
        logging.error(f"Error on day offset {day:.2f}: {e}")
        return None

# app/utils.py

def calculate_next_window(target_date=None):
    """计算从目标日期开始之后的发射窗口期。"""
    # 指定缓存目录
    load = Loader('./skyfield_data')
    ts = load.timescale()
    planets = load('de421.bsp')
    earth = planets['earth']
    mars = planets['mars']
    sun = planets['sun']

    # 定义搜索参数
    days_to_search = 1000       # 搜索范围（天）
    step_days = 0.1             # 步长（天）
    optimal_angle = 44          # 最佳相位角
    angle_tolerance = 2         # 相位角容差

    # 如果未提供目标日期，使用当前日期
    if target_date is None:
        start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=utc)
    else:
        # 将目标日期转换为 datetime 对象
        start_date = datetime.strptime(target_date, '%Y-%m-%d').replace(tzinfo=utc)

    # 生成待计算的天数列表（从 0 开始，只计算目标日期之后的天数）
    days_list = np.arange(0, days_to_search, step_days)

    logging.info(f"Starting calculation with {len(days_list)} steps from date {start_date.date()}.")

    # 使用多进程池并行计算
    max_processes = min(cpu_count(), 18)
    with Pool(processes=max_processes) as pool:
        # 将 start_date 作为固定参数传递给子进程
        results = pool.map(calculate_phase_angle, [(day, start_date) for day in days_list])

    # 过滤结果，移除 None 值
    valid_results = [res for res in results if res is not None]

    # 按 day 排序
    valid_results.sort(key=lambda x: x[0])

    # 遍历结果，寻找符合条件的日期
    for day_diff, window_date, phase_angle in valid_results:
        if abs(phase_angle - optimal_angle) <= angle_tolerance:
            logging.info(f"Found launch window on: {window_date}")
            return window_date.strftime('%Y-%m-%d')

    logging.info(f"No launch window found after {start_date.date()}.")
    return f"未找到从 {start_date.date()} 开始的发射窗口期。"
