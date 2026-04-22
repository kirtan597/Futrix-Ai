Write-Host "Starting Futrix AI Services..." -ForegroundColor Cyan

Start-Process "cmd.exe" -ArgumentList "/k mvn tomcat7:run" -WorkingDirectory "java-gateway" -WindowStyle Normal
Start-Process "cmd.exe" -ArgumentList "/k npm install && node server.js" -WorkingDirectory "node-api" -WindowStyle Normal
Start-Process "cmd.exe" -ArgumentList "/k pip install -r requirements.txt && uvicorn main:app --reload --port 8000" -WorkingDirectory "python-ai" -WindowStyle Normal
Start-Process "cmd.exe" -ArgumentList "/k npm run dev" -WorkingDirectory "client" -WindowStyle Normal

Write-Host "All services started in separate windows." -ForegroundColor Green
