@echo off
cd /d "%~dp0"

REM Ensure Git is on PATH
set "PATH=C:\Program Files\Git\bin;C:\Program Files (x86)\Git\bin;%PATH%"

echo ========================================
echo  Revert to state from 3 days ago
echo ========================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: Git not found. Install Git or run from a terminal where "git" works.
  echo.
  set /p DUMMY=Press ENTER to close this window.
  exit /b 1
)

REM Create backup branch of current state (so you can get back if needed)
echo Creating backup branch "backup-before-revert"...
git branch backup-before-revert 2>nul
if errorlevel 1 (
  echo Backup branch may already exist. Continuing.
) else (
  echo Backup created. To restore later: git reset --hard backup-before-revert
)
echo.

REM Find the most recent commit from 3 days ago
for /f "delims=" %%i in ('git log -1 --before="3 days ago" --format=%%H 2^>nul') do set OLDCOMMIT=%%i

if not defined OLDCOMMIT (
  echo No commit found from 3 days ago. Trying "4 days ago"...
  for /f "delims=" %%i in ('git log -1 --before="4 days ago" --format=%%H 2^>nul') do set OLDCOMMIT=%%i
)

if not defined OLDCOMMIT (
  echo No commit found from 3-4 days ago. Try running in Command Prompt:
  echo   git log --oneline -20
  echo Then reset manually: git reset --hard ^<commit-hash^>
  echo.
  set /p DUMMY=Press ENTER to close this window.
  exit /b 1
)

echo Resetting to commit from 3 days ago: %OLDCOMMIT%
git log -1 --format="  %%h %%s (%%ci)" %OLDCOMMIT%
echo.
echo This will discard all uncommitted and committed changes since then.
set /p CONFIRM="Type YES to continue: "
if /i not "%CONFIRM%"=="YES" (
  echo Cancelled.
  set /p DUMMY=Press ENTER to close.
  exit /b 0
)

git reset --hard %OLDCOMMIT%

echo.
echo ========================================
echo  Done. Repository is now at state from 3 days ago.
echo  To undo: git reset --hard backup-before-revert
echo ========================================
echo.
echo If ENTER does nothing, close this window with the X button.
set /p DUMMY=Press ENTER to close this window.
