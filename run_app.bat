@echo off
cd /d "%~dp0"

echo ==========================================
echo   AETHER Student Assistant - Launcher
echo ==========================================
echo.

:: Check for Node.js
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if missing
if not exist "node_modules" (
    echo [INFO] First run detected. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b %errorlevel%
    )
)

echo [INFO] Starting application...
echo [INFO] The browser will open automatically.
echo.

:: Open browser in a separate process
start "" "http://localhost:3000"

:: Start the Vite development server
npm run dev
