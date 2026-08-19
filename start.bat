@echo off
title Study with HERO - Dev Server
color 0A
echo.
echo  ============================================
echo   STUDY WITH HERO - Development Server
echo  ============================================
echo.
echo  Starting server at http://localhost:3000
echo  Press Ctrl+C to stop the server
echo.
echo  ============================================
echo.

cd /d "%~dp0"

:: Check if node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed!
    echo  Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo  [INFO] Installing dependencies...
    call npm install
    echo.
)

:: Check if prisma client is generated
if not exist "node_modules\.prisma\client" (
    echo  [INFO] Generating Prisma client...
    call npx prisma generate
    echo.
)

:: Check if database exists
if not exist "prisma\dev.db" (
    echo  [INFO] Creating database...
    call npx prisma db push
    echo.
)

echo  [OK] Starting dev server...
echo.

:: Open browser after 5 seconds
start "" /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Start the dev server
call npm run dev
