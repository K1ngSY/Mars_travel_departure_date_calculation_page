// js/script.js

// 全局变量
let scene, camera, renderer, globe;
let rotating = true;
let controls;
let selectedPoint = null;
let hasZoomed = false; // 是否已经放大过

let isDragging = false;
let pointerDownPos = { x: 0, y: 0 };
let pointerUpPos = { x: 0, y: 0 };
const dragThreshold = 5; // 拖动阈值，单位为像素

const baseRotateSpeed = 0.25; // 基础旋转速度

let calculatingInterval; // 用于控制“Calculating...”的动画

init();
animate();

function init() {
    // 创建场景
    scene = new THREE.Scene();

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // 黑色背景
    document.getElementById('container').appendChild(renderer.domElement);

    // 添加星空背景
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
        'textures/starfield.jpg',
        function (texture) {
            const starGeometry = new THREE.SphereGeometry(90, 64, 64);
            const starMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
            });
            const starField = new THREE.Mesh(starGeometry, starMaterial);
            scene.add(starField);
        },
        undefined,
        function (err) {
            console.error('Error loading starfield texture:', err);
        }
    );

    // 创建地球（减小30%）
    Promise.all([
        textureLoader.loadAsync('textures/earth_texture.jpg'),
        textureLoader.loadAsync('textures/earth_bump.jpg'),
        textureLoader.loadAsync('textures/earth_specular.jpg'),
    ])
        .then(([earthTexture, bumpTexture, specularTexture]) => {
            const earthGeometry = new THREE.SphereGeometry(3.5, 64, 64); // 半径减小为3.5
            const earthMaterial = new THREE.MeshPhongMaterial({
                map: earthTexture,
                bumpMap: bumpTexture,
                bumpScale: 0.05,
                specularMap: specularTexture,
                specular: new THREE.Color('grey'),
            });
            globe = new THREE.Mesh(earthGeometry, earthMaterial);
            scene.add(globe);

            // 添加交互控制
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enablePan = false;
            controls.minDistance = 5;
            controls.maxDistance = 20;
            controls.rotateSpeed = baseRotateSpeed;

            // 禁用缩放
            controls.enableZoom = false;

            // 自定义事件监听
            controls.addEventListener('start', () => {
                rotating = false; // 停止自转
            });

            // 监听指针事件
            renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
            renderer.domElement.addEventListener('pointermove', onPointerMove, false);
            renderer.domElement.addEventListener('pointerup', onPointerUp, false);

            // 显示初始提示信息
            document.getElementById('message').classList.remove('hidden');
        })
        .catch((err) => {
            console.error('Error loading earth textures:', err);
        });

    // 添加光源
    // 调整环境光亮度，使整体场景更明亮或更暗
    const ambientLight = new THREE.AmbientLight(0x666666); // 原值为 0x333333，增大环境光亮度
    scene.add(ambientLight);

    // 调整平行光的亮度和发散度
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // 将强度从 1 降低到 0.5
    directionalLight.position.set(5, 3, 5);

    // 添加平行光辅助工具，可视化光源方向（可选）
    // const helper = new THREE.DirectionalLightHelper(directionalLight, 1);
    // scene.add(helper);

    // 添加一个光照发散效果（柔化阴影）
    directionalLight.castShadow = true;
    directionalLight.shadow.radius = 2; // 增大阴影半径，柔化阴影边缘

    scene.add(directionalLight);

    // 窗口大小改变事件
    window.addEventListener('resize', onWindowResize, false);

    // 重置按钮事件
    document.getElementById('resetButton').addEventListener('click', resetScene);

    // 更新系统时间
    updateTime();
    setInterval(updateTime, 1000);

    // 获取天气信息
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeather, showError);
    } else {
        alert('Your browser does not support geolocation, unable to get weather information.');
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (rotating && globe) {
        globe.rotation.y += 0.002;
    }

    if (controls) {
        // 根据地球的缩放比例调整旋转速度
        controls.rotateSpeed = Math.max(0.05, baseRotateSpeed / globe.scale.x);
        controls.update();
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
    // 检查是否为左键点击
    if (event.button !== 0) return;

    isDragging = false;
    pointerDownPos.x = event.clientX;
    pointerDownPos.y = event.clientY;
}

function onPointerMove(event) {
    // 判断指针移动距离，超过阈值则认为在拖动
    if (!isDragging) {
        const moveX = event.clientX - pointerDownPos.x;
        const moveY = event.clientY - pointerDownPos.y;
        if (Math.sqrt(moveX * moveX + moveY * moveY) > dragThreshold) {
            isDragging = true;
        }
    }
}

function onPointerUp(event) {
    // 检查是否为左键点击
    if (event.button !== 0) return;

    pointerUpPos.x = event.clientX;
    pointerUpPos.y = event.clientY;

    // 如果没有拖动，认为是点击
    if (!isDragging) {
        handleClick(event);
    }
}

function handleClick(event) {
    event.preventDefault();

    // 获取鼠标位置
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // 射线投射
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 检测与地球的交互
    const intersects = raycaster.intersectObject(globe);

    if (intersects.length > 0) {
        // 更新选中的点
        selectedPoint = intersects[0].point.clone().normalize();

        // 如果还没有放大过，就放大地球
        if (!hasZoomed) {
            // 放大地球到比原来还大2倍
            const newScale = globe.scale.x * 2;

            // 使用 GSAP 实现动画
            gsap.to(globe.scale, {
                x: newScale,
                y: newScale,
                z: newScale,
                duration: 2,
            });

            hasZoomed = true;
        }

        // 移动相机到新的位置
        gsap.to(camera.position, {
            x: selectedPoint.x * 10,
            y: selectedPoint.y * 10,
            z: selectedPoint.z * 10,
            duration: 2,
            onUpdate: function () {
                camera.lookAt(0, 0, 0);
                controls.update();
            },
        });

        // 显示“确认”按钮
        const confirmButton = document.getElementById('confirmButton');
        if (confirmButton.classList.contains('hidden')) {
            confirmButton.classList.remove('hidden');
            confirmButton.addEventListener('click', onConfirmButtonClick);
        }
    }
}

function onConfirmButtonClick() {
    if (!selectedPoint) return;

    // 显示日期选择弹窗
    document.getElementById('dateModal').classList.remove('hidden');

    // 绑定确认日期按钮事件
    document
        .getElementById('confirmDate')
        .addEventListener('click', onConfirmDate);
}

function onConfirmDate() {
    const dateValue = document.getElementById('dateInput').value || null;

    // 隐藏日期选择弹窗
    document.getElementById('dateModal').classList.add('hidden');

    // 隐藏初始提示消息
    const messageDiv = document.getElementById('message');
    messageDiv.classList.add('hidden');

    // 显示“Calculating...”消息
    const calculatingMessage = document.getElementById('calculatingMessage');
    calculatingMessage.classList.remove('hidden');

    // 添加省略号动画
    let dotCount = 0;
    calculatingInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        document.getElementById('dots').textContent = '.'.repeat(dotCount);
    }, 500);

    // 调用后端 API
    let requestUrl = 'http://localhost:5000/api/window/next';
    if (dateValue) {
        requestUrl += `?date=${dateValue}`;
    }

    fetch(requestUrl)
        .then((response) => response.json())
        .then((data) => {
            // 清除“Calculating...”动画
            clearInterval(calculatingInterval);
            calculatingMessage.classList.add('hidden');

            // 显示结果信息
            messageDiv.textContent = `The next departure date is ${data.nextWindow}`;
            messageDiv.classList.remove('hidden');
            messageDiv.classList.add('result-message'); // 添加结果消息样式

            // 显示祝福弹窗
            document.getElementById('successModal').classList.remove('hidden');
            document
                .getElementById('closeSuccessModal')
                .addEventListener('click', function () {
                    document.getElementById('successModal').classList.add('hidden');
                });

            // 镜头复位并缩小地球
            gsap.to(globe.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 2,
            });

            gsap.to(controls.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: 2,
            });

            gsap.to(camera.position, {
                x: 0,
                y: 0,
                z: 10,
                duration: 2,
                onUpdate: function () {
                    camera.lookAt(0, 0, 0);
                    controls.update();
                },
                onComplete: function () {
                    // 开始自转
                    rotating = true;

                    // 重置选中点和放大状态
                    selectedPoint = null;
                    hasZoomed = false;

                    // 隐藏“确认”按钮
                    const confirmButton = document.getElementById('confirmButton');
                    confirmButton.classList.add('hidden');
                    confirmButton.removeEventListener('click', onConfirmButtonClick);
                },
            });
        })
        .catch((error) => {
            alert('An error occurred, unable to get the launch window.');
            console.error('Error:', error);

            // 清除“Calculating...”动画
            clearInterval(calculatingInterval);
            calculatingMessage.classList.add('hidden');

            // 重新显示初始提示消息
            messageDiv.classList.remove('hidden');
        });
}

function resetScene() {
    // 隐藏初始提示信息
    const messageDiv = document.getElementById('message');
    messageDiv.classList.add('hidden');
    messageDiv.textContent = 'Click to confirm your departure location';
    messageDiv.classList.remove('result-message');
    messageDiv.classList.remove('hidden');

    // 隐藏“Calculating...”消息
    const calculatingMessage = document.getElementById('calculatingMessage');
    calculatingMessage.classList.add('hidden');
    clearInterval(calculatingInterval);

    // 隐藏日期选择弹窗和成功提示弹窗
    document.getElementById('dateModal').classList.add('hidden');
    document.getElementById('successModal').classList.add('hidden');

    // 重置地球大小
    globe.scale.set(1, 1, 1);

    // 重置相机位置和控制器
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    controls.reset();

    rotating = true;

    // 重置选中点和放大状态
    selectedPoint = null;
    hasZoomed = false;

    // 隐藏“确认”按钮
    const confirmButton = document.getElementById('confirmButton');
    confirmButton.classList.add('hidden');
    confirmButton.removeEventListener('click', onConfirmButtonClick);
}

// 调整放大后的地球模型移动速度的方法：
// 在 animate() 函数中，修改 controls.rotateSpeed 的计算方式。
// 您可以根据需求调整公式，或者在放大后设置固定的 rotateSpeed。
// 例如，要在放大后设置固定的旋转速度，可以这样修改：

/*
if (controls) {
    if (hasZoomed) {
        controls.rotateSpeed = 0.1; // 放大后设置的旋转速度
    } else {
        controls.rotateSpeed = baseRotateSpeed;
    }
    controls.update();
}
*/

// 更新系统时间
function updateTime() {
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const formattedTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString() + ' ' + days[now.getDay()];
    document.getElementById('currentTime').textContent = formattedTime;
}

// 获取天气信息
function getWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // 使用 Open-Meteo API 获取天气信息
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            const temperature = data.current_weather.temperature;
            const windspeed = data.current_weather.windspeed;
            const weathercode = data.current_weather.weathercode;
            const weatherDescription = getWeatherDescription(weathercode);

            document.getElementById('currentWeather').textContent =
                `Current weather: ${weatherDescription}, Temperature: ${temperature}°C, Wind speed: ${windspeed} km/h`;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function showError(error) {
    console.error('Error getting geolocation:', error);
    alert('Unable to get your location, cannot retrieve weather information.');
}

// 将天气代码映射为描述
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return weatherCodes[code] || 'Unknown weather';
}
