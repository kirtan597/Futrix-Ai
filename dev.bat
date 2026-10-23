@echo off
title Futrix AI - Dev Launcher
color 0A

echo.
echo  =======================================================
echo               FUTRIX AI - DEV LAUNCHER
echo  =======================================================
echo.

:: Detect workspace root directory
set "DIR=%~dp0"
if exist "%DIR%Futrix-Ai\node-api\package.json" (
    set "PROJECT_ROOT=%DIR%Futrix-Ai"
) else if exist "%DIR%node-api\package.json" (
    set "PROJECT_ROOT=%DIR%"
) else (
    set "PROJECT_ROOT=d:\Projects\Futrix-Ai\Futrix-Ai"
)

:: Strip trailing backslash if any
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

set "PYTHON_AI=%PROJECT_ROOT%\python-ai"
set "NODE_API=%PROJECT_ROOT%\node-api"
set "CLIENT=%PROJECT_ROOT%\client"

echo [Status] Project root: "%PROJECT_ROOT%"
echo [Status] Clearing previous instances on ports 5000, 5173, 8000...

:: Kill any existing processes bound to dev ports (single-line loop avoids cmd parentheses parsing errors)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 " ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo [1/3] Starting Python AI (FastAPI on port 8000)...
start "Futrix AI | Python AI :8000" cmd /k "title Futrix AI ^| Python AI && cd /d "%PYTHON_AI%" && if exist .venv\Scripts\activate.bat call .venv\Scripts\activate.bat && if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --port 8000"

echo [2/3] Starting Node API (Express on port 5000)...
start "Futrix AI | Node API :5000" cmd /k "title Futrix AI ^| Node API && cd /d "%NODE_API%" && node --watch server.js"

echo [3/3] Starting React Client (Vite on port 5173)...
start "Futrix AI | React Client :5173" cmd /k "title Futrix AI ^| React Client && cd /d "%CLIENT%" && npm run dev"

echo.
echo  =======================================================
echo   All 3 services launched in separate windows!
echo   - Frontend:  http://localhost:5173
echo   - Node API:  http://localhost:5000
echo   - Python AI: http://localhost:8000
echo  =======================================================
echo.
echo  Press any key to close this launcher window.
pause >nul
