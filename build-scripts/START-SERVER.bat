@echo off
cd /d "%~dp0"
echo ========================================
echo  Starting Dev Server
echo ========================================
echo.
echo When you see "Local: http://localhost:5174"
echo Open that URL in your browser!
echo.
"C:\Program Files\nodejs\npm.cmd" run dev
pause
