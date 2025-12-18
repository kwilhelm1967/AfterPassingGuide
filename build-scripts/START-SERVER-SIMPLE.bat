@echo off
title Dev Server - DO NOT CLOSE
cd /d "%~dp0"

echo.
echo ========================================
echo  Starting Dev Server
echo ========================================
echo.
echo Current directory: %CD%
echo.

if not exist "C:\Program Files\nodejs\npm.cmd" (
    echo ERROR: npm.cmd not found at "C:\Program Files\nodejs\npm.cmd"
    echo.
    echo Please check if Node.js is installed.
    echo.
    pause
    exit /b 1
)

echo Found npm.cmd - starting server...
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
echo.
echo ========================================
echo  Server stopped or had an error
echo ========================================
echo.
pause


