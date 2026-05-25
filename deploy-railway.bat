@echo off
REM Railway Deployment Preparation Script for Windows

echo.
echo ======================================================
echo Photo Booth - Railway Deployment Setup
echo ======================================================
echo.
echo This script will prepare your app for Railway deployment
echo.

echo [1/3] Optimizing dependencies...
call composer install --no-dev --optimize-autoloader
call npm ci
echo.

echo [2/3] Building frontend...
call npm run build
echo.

echo [3/3] Git status...
echo.
git status
echo.

echo ======================================================
echo Setup Complete!
echo ======================================================
echo.
echo Next steps:
echo.
echo 1. Push to GitHub:
echo    git push origin main
echo.
echo 2. Go to https://railway.app
echo 3. Login with GitHub
echo 4. New Project ^> Deploy from GitHub
echo 5. Select 'web-tania' repository
echo 6. Add environment variables (Midtrans keys)
echo 7. Deploy!
echo.
echo For detailed guide, see RAILWAY_QUICK_START.md
echo.
pause
