@echo off
cd /d "%~dp0"

set "PATH=C:\Program Files\Git\bin;C:\Program Files (x86)\Git\bin;%PATH%"

echo ========================================
echo  Reset AfterPassing Guide to last commit
echo ========================================
echo.
echo This will discard all uncommitted changes.
set /p CONFIRM="Type YES to continue: "
if /i not "%CONFIRM%"=="YES" (
  echo Cancelled.
  pause
  exit /b 0
)

git reset --hard HEAD

echo.
echo Done. Project reset to last commit.
echo.
pause
