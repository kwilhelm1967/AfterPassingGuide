@echo off
cd /d "%~dp0"

echo ========================================
echo  Starting Dev Server
echo ========================================
echo.
echo When you see "Local: http://localhost:5174"
echo Open that URL in your browser!
echo.
echo KEEP THIS WINDOW OPEN!
echo.
echo ========================================
echo.

"C:\Program Files\nodejs\npm.cmd" run dev

if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start!
    echo Check the error messages above.
    echo.
)

echo.
pause


