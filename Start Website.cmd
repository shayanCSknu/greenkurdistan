@echo off
cd /d "%~dp0"
node server\launch.js
if errorlevel 1 (
  echo Install Node.js 24 or newer if node is not available.
  pause
  exit /b 1
)
if not defined PORT set "PORT=3000"
start "" "http://localhost:%PORT%/"
