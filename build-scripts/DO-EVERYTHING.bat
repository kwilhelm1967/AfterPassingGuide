@echo off
echo ========================================
echo  Setting up and starting server...
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Deleting corrupted node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo Done!
) else (
    echo node_modules not found.
)

echo.
echo Step 2: Installing dependencies...
echo This may take 1-2 minutes...
"C:\Program Files\nodejs\npm.cmd" install

if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Starting dev server...
echo.
echo ========================================
echo  Server starting...
echo  When you see "Local: http://localhost:5174"
echo  Open that URL in your browser!
echo ========================================
echo.

"C:\Program Files\nodejs\npm.cmd" run dev

pause

