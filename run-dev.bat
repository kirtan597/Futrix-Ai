@echo off
title Futrix AI
color 0A
cls

echo.
echo  =====================================================
echo        FUTRIX AI  ^|  Starting All Services
echo  =====================================================
echo.
echo   Opening 4 windows...
echo.

:: ── Window 1: Python AI Engine ───────────────────────
start "🐍 Python AI - localhost:8000" cmd /k "color 0B && cd /d "%~dp0python-ai" && echo. && echo  ================================ && echo   Python AI Engine - Port 8000 && echo  ================================ && echo. && uvicorn main:app --reload --port 8000"

:: ── Window 2: Node.js API ─────────────────────────────
start "⚡ Node API - localhost:5000" cmd /k "color 0E && cd /d "%~dp0node-api" && echo. && echo  ================================ && echo   Node.js API - Port 5000 && echo  ================================ && echo. && node server.js"

:: ── Window 3: React Frontend ──────────────────────────
start "⚛  React - localhost:5173" cmd /k "color 0D && cd /d "%~dp0client" && echo. && echo  ================================ && echo   React Frontend - Port 5173 && echo  ================================ && echo. && npm run dev"

:: ── Window 4: Browser (after 8s boot wait) ───────────
start "🌐 Browser" cmd /k "color 0A && echo. && echo  Waiting for services to boot... && timeout /t 8 /nobreak && echo. && echo  Opening http://localhost:5173 && start "" http://localhost:5173 && exit"

echo  =====================================================
echo   4 windows launched!
echo.
echo   [1] Python AI  ->  http://localhost:8000
echo   [2] Node API   ->  http://localhost:5000
echo   [3] React      ->  http://localhost:5173
echo   [4] Browser    ->  auto opens in 8 seconds
echo  =====================================================
echo.
pause
