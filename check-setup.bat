@echo off
echo ========================================
echo Career Twin AI - OAuth Setup Check
echo ========================================
echo.

echo [1] Checking Backend .env file...
findstr "GOOGLE_CLIENT_ID" node-api\.env
echo.

echo [2] Checking Frontend .env file...
findstr "VITE_GOOGLE_CLIENT_ID" client\.env
echo.

echo [3] Testing Backend Health...
curl -s http://localhost:5000/health
echo.
echo.

echo [4] Testing Backend OAuth Endpoint...
curl -s -X POST http://localhost:5000/api/auth/google -H "Content-Type: application/json" -d "{\"credential\":\"test\"}"
echo.
echo.

echo ========================================
echo Setup Check Complete!
echo ========================================
echo.
echo If you see errors above, the backend is not running.
echo Start it with: cd node-api && npm start
echo.
pause
