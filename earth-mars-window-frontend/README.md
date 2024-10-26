# Earth to Mars Launch Window Reservation

An interactive 3D web application that allows users to select a departure location on Earth and calculate the next available launch window to Mars. The application features a rotating Earth model, displays the current system time, and shows local weather information based on the user's geolocation.

## Features

- **Interactive 3D Earth Model**: Rotate and zoom into a 3D model of Earth using mouse interactions.
- **Departure Location Selection**: Click on the globe to select your departure location. The Earth will zoom in and focus on the selected point.
- **Date Input**: After selecting a location, input a date to find the next available launch window after that date.
- **Real-time System Time**: Displays the current date and time, including the day of the week.
- **Local Weather Information**: Shows current weather conditions based on the user's geolocation.
- **Smooth Animations**: Utilizes GSAP for smooth transitions and animations.
- **Responsive Design**: Adjusts to different screen sizes and devices.

## Installation

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd <project-directory>
   ```

3. **Set Up the Backend API**

   - Ensure that you have the backend server running, which provides the API endpoint for calculating the next launch window.
   - Update the backend server IP address in `js/script.js`:

     ```javascript
     let requestUrl = 'http://<backend-server-ip>:5000/api/window/next';
     ```

     Replace `<backend-server-ip>` with your backend server's IP address or domain name.

4. **Prepare Assets**

   Ensure that the `textures` folder contains the following files:

   - `starfield.jpg`
   - `earth_texture.jpg`
   - `earth_bump.jpg`
   - `earth_specular.jpg`

## Usage

1. **Run a Local Server**

   You need to serve the files using a local server. You can use Python's built-in server or any static file server.

   - Using Python 3:

     ```bash
     python -m http.server 8000
     ```

   - Using Node.js `http-server`:

     ```bash
     npx http-server -p 8000
     ```

2. **Open the Application in a Browser**

   Navigate to `http://localhost:8000` in your web browser.

3. **Interact with the Application**

   - **Rotate the Earth**: Click and drag to rotate the Earth. The Earth will rotate smoothly following your mouse movements.
   - **Select Departure Location**: Click on any location on the Earth to select your departure point. The Earth will zoom in (only on the first click) and focus on the selected location.
   - **Confirm Selection**: A "Confirm" button will appear after selecting a location. Click it to proceed.
   - **Input Date**: A date selection modal will appear. Choose the date after which you wish to depart (leave blank for today) and click "Confirm."
   - **Calculating**: A "Calculating..." message will appear in the center of the screen with animated dots, indicating that the application is processing your request.
   - **View Results**: The next available departure date will be displayed at the bottom center of the screen with a gold flowing text effect and larger font size.
   - **Wish Message**: A modal saying "Wish you a pleasant journey!" will appear. Click "Close" to dismiss it.
   - **Reset**: Click the "Reset" button at any time to reset the application to its initial state.

## Configuration

### Adjusting the Earth's Zoom Level

To change the zoom level when clicking on the Earth, modify the zoom factor in `js/script.js`:

```javascript
// In handleClick function
const newScale = globe.scale.x * 2; // Change '2' to your desired zoom factor
```

### Adjusting Rotation Speed

To adjust the Earth's rotation speed after zooming in, modify the `controls.rotateSpeed` value in `js/script.js`:

```javascript
// In animate function
controls.rotateSpeed = Math.max(0.05, baseRotateSpeed / globe.scale.x);
```

Or set a fixed rotation speed after zooming:

```javascript
// Uncomment and modify as needed
/*
if (controls) {
    if (hasZoomed) {
        controls.rotateSpeed = 0.1; // Set to desired speed
    } else {
        controls.rotateSpeed = baseRotateSpeed;
    }
    controls.update();
}
*/
```

### Adjusting Lighting

To adjust the lighting effects, modify the parameters in `js/script.js`:

```javascript
// Ambient Light
const ambientLight = new THREE.AmbientLight(0x666666); // Adjust color value for brightness

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Adjust intensity (0 to 1)
directionalLight.position.set(5, 3, 5); // Adjust position to change light angle

// Shadow Softness
directionalLight.castShadow = true;
directionalLight.shadow.radius = 2; // Increase for softer shadows
```

## Dependencies

- [Three.js](https://threejs.org/) for 3D rendering.
- [GSAP](https://greensock.com/gsap/) for animations.
- [Open-Meteo API](https://open-meteo.com/) for weather data.
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) for mouse interaction.

All dependencies are included via CDN links in the `index.html` file.

## Browser Compatibility

This application requires a modern web browser with WebGL and Geolocation API support, such as:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

## Notes

- **Geolocation and Weather Information**: Users need to allow location access for the application to fetch local weather data. If denied, weather information will not be displayed.
- **Cross-Origin Requests**: Ensure that your backend API supports CORS to allow the front-end application to make requests.

## License

This project is licensed under the MIT License.

---

**Enjoy your interactive journey from Earth to Mars!**