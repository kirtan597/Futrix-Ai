@echo off
echo Starting AI Career Twin...

start "MongoDB" cmd /k "mongod"
timeout /t 3 >nul

start "Python AI" cmd /k "cd /d %~dp0python-ai && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 >nul

start "Node API" cmd /k "cd /d %~dp0node-api && npm start"
timeout /t 2 >nul

start "Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo All services started!
echo   MongoDB    : localhost:27017
echo   Python AI  : http://localhost:8000
echo   Node API   : http://localhost:5000
echo   Frontend   : http://localhost:5173
