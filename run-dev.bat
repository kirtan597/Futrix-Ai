@echo off
echo Starting AI Career Twin...

start "MongoDB" cmd /k "mongod"
timeout /t 3 >nul

start "Node API" cmd /k "cd /d %~dp0node-api && npm start"
timeout /t 2 >nul

start "Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo All services started!
echo   MongoDB  : localhost:27017
echo   Node API : http://localhost:5000
echo   Frontend : http://localhost:5173
