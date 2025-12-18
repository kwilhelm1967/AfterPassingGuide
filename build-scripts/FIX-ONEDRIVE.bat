@echo off
echo ========================================
echo Fixing OneDrive node_modules Issue
echo ========================================
echo.

echo Step 1: Deleting corrupted node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo node_modules deleted.
) else (
    echo node_modules not found.
)

echo.
echo Step 2: Reinstalling dependencies...
"C:\Program Files\nodejs\npm.cmd" install

echo.
echo Step 3: Starting dev server...
"C:\Program Files\nodejs\npm.cmd" run dev

pause

