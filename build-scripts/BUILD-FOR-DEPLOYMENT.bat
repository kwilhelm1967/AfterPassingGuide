@echo off
title Building for Deployment
cd /d "%~dp0"

echo ========================================
echo  Building Project for Deployment
echo ========================================
echo.

REM Add Node.js to PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

echo Step 1: Building project...
echo This may take 1-2 minutes...
echo.

"C:\Program Files\nodejs\npm.cmd" run build

if errorlevel 1 (
    echo.
    echo ========================================
    echo  ERROR: Build failed!
    echo ========================================
    echo.
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✓ Build Complete!
echo ========================================
echo.
echo Your production files are in the 'dist' folder.
echo.
echo TO DEPLOY:
echo 1. Open the 'dist' folder
echo 2. Upload ALL contents to your hosting site
echo 3. Make sure index.html is in the root of your site
echo.
echo ========================================
echo.
pause


