@echo off
cd /d "%~dp0"

echo ========================================
echo  Installing Dependencies
echo ========================================
echo.
echo This will take 1-2 minutes...
echo.

"C:\Program Files\nodejs\npm.cmd" install

if errorlevel 1 (
    echo.
    echo ========================================
    echo  ERROR: Installation failed!
    echo ========================================
    echo.
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Dependencies installed successfully!
echo ========================================
echo.
echo ========================================
echo  Starting Dev Server
echo ========================================
echo.
echo When you see "Local: http://localhost:5174"
echo Open that URL in your browser!
echo.
echo KEEP THIS WINDOW OPEN - DO NOT CLOSE IT!
echo.
echo ========================================
echo.

"C:\Program Files\nodejs\npm.cmd" run dev

if errorlevel 1 (
    echo.
    echo ========================================
    echo  ERROR: Server failed to start!
    echo ========================================
    echo.
    echo Check the error messages above.
    echo.
)

echo.
echo.
echo Server stopped. Press any key to close...
pause

