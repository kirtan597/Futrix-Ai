@echo off
echo ========================================
echo   Vercel Deployment Helper
echo ========================================
echo.

echo This script will help you deploy to Vercel.
echo.
echo Prerequisites:
echo 1. Vercel CLI installed (npm install -g vercel)
echo 2. Logged in to Vercel (vercel login)
echo.

:menu
echo ========================================
echo   What would you like to deploy?
echo ========================================
echo.
echo 1. Deploy Backend (Node.js API)
echo 2. Deploy Frontend (React)
echo 3. Deploy Both (Backend first, then Frontend)
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end
echo Invalid choice. Please try again.
goto menu

:backend
echo.
echo ========================================
echo   Deploying Backend...
echo ========================================
echo.
cd /d "%~dp0node-api"
echo Current directory: %CD%
echo.
echo Running: vercel --prod
echo.
vercel --prod
echo.
echo ========================================
echo   Backend Deployment Complete!
echo ========================================
echo.
echo IMPORTANT: Copy your backend URL and add these environment variables:
echo - MONGO_URI
echo - JWT_SECRET
echo - JWT_REFRESH_SECRET
echo - GOOGLE_CLIENT_ID
echo - GOOGLE_CLIENT_SECRET
echo - NODE_ENV=production
echo - FRONTEND_URL (add after frontend deployment)
echo.
pause
goto menu

:frontend
echo.
echo ========================================
echo   Deploying Frontend...
echo ========================================
echo.
cd /d "%~dp0client"
echo Current directory: %CD%
echo.
echo Running: vercel --prod
echo.
vercel --prod
echo.
echo ========================================
echo   Frontend Deployment Complete!
echo ========================================
echo.
echo IMPORTANT: Add these environment variables:
echo - VITE_GOOGLE_CLIENT_ID
echo - VITE_API_URL (your backend URL)
echo.
echo Don't forget to:
echo 1. Update backend FRONTEND_URL with your frontend URL
echo 2. Update Google Console with production URLs
echo.
pause
goto menu

:both
echo.
echo ========================================
echo   Deploying Backend First...
echo ========================================
echo.
cd /d "%~dp0node-api"
vercel --prod
echo.
echo Backend deployed! Press any key to continue with frontend...
pause
echo.
echo ========================================
echo   Now Deploying Frontend...
echo ========================================
echo.
cd /d "%~dp0client"
vercel --prod
echo.
echo ========================================
echo   Both Deployments Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Add environment variables to both projects in Vercel dashboard
echo 2. Update backend FRONTEND_URL with your frontend URL
echo 3. Update Google Console with production URLs
echo 4. Test your deployed app!
echo.
pause
goto menu

:end
echo.
echo Goodbye!
echo.
pause
