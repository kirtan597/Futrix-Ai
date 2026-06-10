@echo off
echo ==========================================
echo 🚀 Futrix AI - Production Build
echo ==========================================
echo.

echo 🧹 Cleaning up old builds...
if exist "client\dist" rmdir /s /q "client\dist"
if exist "node-api\node_modules" echo   ✅ Node API dependencies exist
if exist "client\node_modules" echo   ✅ Client dependencies exist
if exist "python-ai\__pycache__" rmdir /s /q "python-ai\__pycache__"
echo.

echo 📦 Installing production dependencies...
echo.

REM Node API
echo [1/3] Node API dependencies...
cd node-api
call npm install --production=false
if errorlevel 1 (
    echo ❌ Failed to install Node API dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo   ✅ Node API ready

REM Client
echo [2/3] Client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ❌ Failed to install Client dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo   ✅ Client ready

REM Python AI
echo [3/3] Python AI dependencies...
cd python-ai
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ❌ Failed to install Python AI dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo   ✅ Python AI ready
echo.

echo 🏗️ Building production bundles...
echo.

REM Build Client
echo Building React frontend...
cd client
call npm run build
if errorlevel 1 (
    echo ❌ Client build failed
    cd ..
    pause
    exit /b 1
)
cd ..
echo   ✅ Client built successfully
echo.

REM Test builds
echo 🧪 Running production tests...
echo.

echo Testing Node API...
cd node-api
node -c server.js
if errorlevel 1 (
    echo ❌ Node API has syntax errors
    cd ..
    pause
    exit /b 1
)
cd ..
echo   ✅ Node API syntax valid

echo Testing Python AI...
cd python-ai
python -m py_compile main.py ai_engine.py
if errorlevel 1 (
    echo ❌ Python AI has syntax errors
    cd ..
    pause
    exit /b 1
)
cd ..
echo   ✅ Python AI syntax valid
echo.

REM Check build sizes
echo 📊 Build Statistics:
echo ==========================================
echo.

if exist "client\dist" (
    for /f "tokens=3" %%a in ('dir /s "client\dist" ^| find "File(s)"') do (
        echo   Frontend bundle: %%a bytes
    )
)

echo   Node API modules: Installed
echo   Python AI modules: Installed
echo.

echo ==========================================
echo ✅ Production Build Complete!
echo ==========================================
echo.
echo 📦 Build artifacts:
echo   • Client: client/dist/
echo   • Node API: node-api/ (ready)
echo   • Python AI: python-ai/ (ready)
echo.
echo 🚀 Next steps:
echo   1. Review DEPLOYMENT_GUIDE.md
echo   2. Deploy to Vercel/Render/Railway
echo   3. Configure environment variables
echo   4. Test your live deployment
echo.
echo 💡 Quick Deploy:
echo   • Frontend: vercel deploy client
echo   • Backend: git push (Render auto-deploys)
echo.
pause