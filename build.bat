@echo off
cd /d "%~dp0"
title AfterPassing Guide - Build

REM Ensure Node is on PATH (common install locations)
if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;%PATH%"
if exist "%APPDATA%\nvm\node.exe" set "PATH=%APPDATA%\nvm;%PATH%"

echo ========================================
echo  AfterPassing Guide - Build
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Please install Node.js and add it to PATH.
  echo Or run this from a Command Prompt where "node" and "npm" work.
  echo.
  set /p DUMMY=Press ENTER to close this window.
  exit /b 1
)

if not exist "node_modules" (
  echo Running npm install first...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    set /p DUMMY=Press ENTER to close this window.
    exit /b 1
  )
  echo.
)

echo Running: npm run build
echo.
call npm run build

if errorlevel 1 (
  echo.
  echo ========================================
  echo  BUILD FAILED - scroll up to see errors
  echo ========================================
echo.
echo You can close this window with the X button if needed.
pause
exit /b 1
)

echo.
echo ========================================
echo  BUILD OK - output is in the dist folder
echo ========================================
echo.
echo If running from Cursor and ENTER does nothing, close this window with the X button.
set /p DUMMY=Press ENTER to close this window.
