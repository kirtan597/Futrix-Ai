@echo off
echo ========================================
echo 🚀 Starting Futrix AI Development Stack
echo ========================================
echo.

REM Run environment validation first
echo 🔍 Validating environment...
node validate-env.js
if errorlevel 1 (
    echo.
    echo ❌ Environment validation failed. Please fix the issues above.
    pause
    exit /b 1
)

echo ✅ Environment validation passed!
echo.

echo 🔧 Checking dependencies...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.9+
    pause
    exit /b 1
)

REM Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java not found. Please install Java 11+
    pause
    exit /b 1
)

REM Check Maven
mvn --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven not found. Please install Apache Maven
    pause
    exit /b 1
)

echo ✅ All dependencies found
echo.

echo 🏗️ Installing dependencies...

REM Install Node API dependencies
echo Installing Node API dependencies...
cd node-api
call npm install --silent
if errorlevel 1 (
    echo ❌ Failed to install Node API dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Install Python AI dependencies
echo Installing Python AI dependencies...
cd python-ai
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ❌ Failed to install Python AI dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Install Client dependencies
echo Installing Client dependencies...
cd client
call npm install --silent
if errorlevel 1 (
    echo ❌ Failed to install Client dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ All dependencies installed
echo.

echo 🚀 Starting services...
echo.

REM Start Java Gateway
echo 🛡️ Starting Java Gateway (Port 8080)...
start "Java Gateway" cmd /k "cd java-gateway && mvn tomcat7:run"
timeout /t 3 /nobreak >nul

REM Start Python AI Engine
echo 🐍 Starting Python AI Engine (Port 8000)...
start "Python AI" cmd /k "cd python-ai && uvicorn main:app --reload --port 8000"
timeout /t 3 /nobreak >nul

REM Start Node API
echo 🌐 Starting Node API (Port 5000)...
start "Node API" cmd /k "cd node-api && npm run dev"
timeout /t 3 /nobreak >nul

REM Start React Client
echo ⚛️ Starting React Client (Port 5173)...
start "React Client" cmd /k "cd client && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo ✅ All services started successfully!
echo ========================================
echo.
echo 📊 Service URLs:
echo   • React Client:    http://localhost:5173
echo   • Node API:        http://localhost:5000
echo   • Python AI:       http://localhost:8000
echo   • Java Gateway:    http://localhost:8080
echo.
echo 🔧 Health Check URLs:
echo   • Node API Health: http://localhost:5000/health
echo   • Python AI Docs:  http://localhost:8000/docs
echo.
echo 💡 Tips:
echo   • Wait 10-15 seconds for all services to fully start
echo   • Check each terminal window for any startup errors
echo   • MongoDB should be running on localhost:27017
echo.
echo Press any key to open the application...
pause >nul

REM Open the application in default browser
start http://localhost:5173

echo.
echo 🎉 Futrix AI is now running!
echo Press any key to exit...
pause >nul