@echo off
setlocal
REM Double-click or run from cmd to start ors-web on Windows.
REM Usage:
REM   serve-ors-web.bat
REM   serve-ors-web.bat C:\apps\ors-web 8080

cd /d "%~dp0"

set "DIST=%~1"
set "PORT=%~2"
if "%PORT%"=="" set "PORT=8080"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install LTS from https://nodejs.org then try again.
  pause
  exit /b 1
)

if "%DIST%"=="" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-ors-web.ps1" -Port %PORT%
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-ors-web.ps1" -DistPath "%DIST%" -Port %PORT%
)

pause
