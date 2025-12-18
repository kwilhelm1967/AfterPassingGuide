@echo off
title DEBUG - Dev Server
cd /d "%~dp0"

echo.
echo ========================================
echo  DEBUG MODE - Dev Server
echo ========================================
echo.
echo Step 1: Checking current directory...
echo Current directory: %CD%
echo.

echo Step 2: Checking if npm.cmd exists...
if exist "C:\Program Files\nodejs\npm.cmd" (
    echo [OK] npm.cmd found!
) else (
    echo [ERROR] npm.cmd NOT found!
    echo.
    pause
    exit /b 1
)
echo.

echo Step 3: Checking if node_modules exists...
if exist "node_modules" (
    echo [OK] node_modules folder exists
) else (
    echo [WARNING] node_modules folder NOT found
)
echo.

echo Step 4: Checking if vite exists...
if exist "node_modules\.bin\vite.cmd" (
    echo [OK] vite.cmd found!
) else (
    echo [ERROR] vite.cmd NOT found!
    echo You need to run: npm install
    echo.
    pause
    exit /b 1
)
echo.

echo Step 5: Starting server...
echo.
echo ========================================
echo  When you see "Local: http://localhost:5174"
echo  Open that URL in your browser!
echo ========================================
echo.
echo KEEP THIS WINDOW OPEN!
echo.

"C:\Program Files\nodejs\npm.cmd" run dev

echo.
echo ========================================
echo  Server command finished
echo ========================================
echo.
echo Press any key to close this window...
pause


