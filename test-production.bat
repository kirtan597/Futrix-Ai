@echo off
echo ==========================================
echo 🧪 Futrix AI - Test Production Build
echo ==========================================
echo.
echo This script tests your production builds locally
echo before deploying to ensure everything works.
echo.
pause

REM Check if builds exist
if not exist "client\dist\index.html" (
    echo ❌ Client build not found
    echo Please run: build-production.bat first
    pause
    exit /b 1
)

echo ✅ Client build found
echo.

echo Starting production test servers...
echo.

REM Start Python AI
echo 🐍 Starting Python AI (Production Mode)...
start "Python AI - Production" cmd /k "cd python-ai && uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

REM Start Node API
echo 🌐 Starting Node API (Production Mode)...
start "Node API - Production" cmd /k "cd node-api && set NODE_ENV=production && node server.js"
timeout /t 3 /nobreak >nul

REM Start Client with production build
echo ⚛️ Starting Client (Production Build)...
start "Client - Production" cmd /k "cd client && npx serve dist -l 5173"
timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo ✅ All services started!
echo ==========================================
echo.
echo 🧪 Testing URLs:
echo   • Frontend:  http://localhost:5173
echo   • Node API:  http://localhost:5000/health
echo   • Python AI: http://localhost:8000/
echo.
echo 📝 Test Checklist:
echo   [ ] Frontend loads correctly
echo   [ ] No console errors
echo   [ ] API responds to health check
echo   [ ] Python AI returns status
echo   [ ] Login page works
echo   [ ] Navigation works
echo.
echo 💡 If all tests pass, you're ready to deploy!
echo.

REM Open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo Press any key to open health checks...
pause >nul

start http://localhost:5000/health
start http://localhost:8000/

echo.
echo ✅ Production test environment running
echo Close the terminal windows when done testing
echo.
pause