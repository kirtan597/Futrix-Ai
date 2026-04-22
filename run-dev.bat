@echo off
echo Starting Futrix AI Services...

start "Java Gateway" /D "java-gateway" cmd /c "mvn tomcat7:run"
start "Node API" /D "node-api" cmd /c "npm install && node server.js"
start "Python AI" /D "python-ai" cmd /c "pip install -r requirements.txt && uvicorn main:app --reload --port 8000"
start "Client" /D "client" cmd /c "npm run dev"

echo All services attempt to start in new windows.
pause
