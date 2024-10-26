# Earth-Mars Launch Window Backend

This project provides a backend service to calculate the next Earth-to-Mars launch window based on a given target date. The service exposes a RESTful API that calculates the optimal launch window by computing the phase angle between Earth and Mars using astronomical data.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Downloading Astronomical Data](#downloading-astronomical-data)
- [Usage](#usage)
  - [Running the Server](#running-the-server)
  - [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- Calculates the next Earth-to-Mars launch window based on a target date.
- Uses precise astronomical data from NASA's JPL.
- Exposes a RESTful API for integration with frontend applications.
- Optimized computation using multiprocessing.
- Supports Cross-Origin Resource Sharing (CORS) for frontend integration.

## Getting Started

### Prerequisites

- **Python 3.7 or higher**
- **pip** (Python package installer)
- **Virtualenv** (recommended)
- **Internet connection** (for downloading astronomical data)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/earth-mars-window-backend.git
   cd earth-mars-window-backend
   ```

2. **Create a virtual environment** (recommended)

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**

   - On Windows (Command Prompt):

     ```cmd
     venv\Scripts\activate.bat
     ```

   - On Windows (PowerShell):

     ```powershell
     venv\Scripts\Activate.ps1
     ```

   - On Unix or MacOS:

     ```bash
     source venv/bin/activate
     ```

4. **Install the required dependencies**

   ```bash
   pip install -r requirements.txt
   ```

### Downloading Astronomical Data

The application requires the JPL planetary ephemeris data file `de421.bsp`. Download and place it in the `skyfield_data` directory.

1. **Create the data directory**

   ```bash
   mkdir skyfield_data
   ```

2. **Download the `de421.bsp` file**

   - Download link: [https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de421.bsp](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de421.bsp)

3. **Place the file in the `skyfield_data` directory**

   ```bash
   mv de421.bsp skyfield_data/
   ```

## Usage

### Running the Server

The application uses the Waitress WSGI server for production deployment.

1. **Ensure the virtual environment is activated**

2. **Run the server**

   ```bash
   python run.py
   ```

   The server will start listening on `http://0.0.0.0:5000`.

### API Documentation

#### Get Next Launch Window

- **Endpoint**: `/api/window/next`
- **Method**: `GET` or `POST`
- **Description**: Calculates and returns the next Earth-to-Mars launch window date starting from the specified target date.

##### Request Parameters

- **date** (optional): Target date in `YYYY-MM-DD` format. If not provided, the current date is used.

##### Example Request

- **GET Request**

  ```bash
  curl -X GET "http://localhost:5000/api/window/next?date=2025-05-01"
  ```

- **POST Request**

  ```bash
  curl -X POST "http://localhost:5000/api/window/next" -d "date=2025-05-01"
  ```

##### Response Example

- **Success**

  ```json
  {
    "nextWindow": "2025-05-14"
  }
  ```

- **Failure**

  ```json
  {
    "nextWindow": "No launch window found after 2025-05-01."
  }
  ```

## Project Structure

```
earth-mars-window-backend/
├── app/
│   ├── __init__.py
│   ├── controllers.py
│   ├── routes.py
│   ├── services.py
│   └── utils.py
├── run.py
├── requirements.txt
├── skyfield_data/
│   └── de421.bsp
├── app.log
└── README.md
```

- **app/**: Contains the Flask application modules.
  - **\_\_init\_\_.py**: Initializes the Flask app and configures CORS.
  - **controllers.py**: Handles incoming requests and responses.
  - **routes.py**: Defines the application routes.
  - **services.py**: Contains business logic.
  - **utils.py**: Utility functions for astronomical calculations.
- **run.py**: Entry point of the application.
- **requirements.txt**: Lists all Python dependencies.
- **skyfield_data/**: Stores astronomical data files.
- **app.log**: Application log file.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.