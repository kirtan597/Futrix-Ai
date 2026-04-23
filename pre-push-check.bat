@echo off
echo ========================================
echo Pre-Push Security Check
echo ========================================
echo.

echo [1] Checking for .env files in git...
git ls-files | findstr "\.env$" >nul
if %errorlevel% equ 0 (
    echo ❌ WARNING: .env files found in git!
    echo    These should NOT be committed!
    git ls-files | findstr "\.env$"
) else (
    echo ✅ No .env files in git (Good!)
)
echo.

echo [2] Checking .gitignore...
findstr /C:".env" .gitignore >nul
if %errorlevel% equ 0 (
    echo ✅ .env is in .gitignore (Good!)
) else (
    echo ❌ WARNING: .env not in .gitignore!
)
echo.

echo [3] Checking for secrets in code...
findstr /S /I "FutrixAiSuperSecretKey" client\src\*.* >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ WARNING: Secrets found in client code!
) else (
    echo ✅ No secrets in client code (Good!)
)
echo.

echo [4] Files to be committed:
git status --short
echo.

echo ========================================
echo Pre-Push Check Complete!
echo ========================================
echo.
echo If everything looks good, run:
echo   git add .
echo   git commit -m "feat: Add OAuth authentication"
echo   git push origin main
echo.
pause
