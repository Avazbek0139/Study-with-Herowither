@echo off
title Push Study with HERO to GitHub
color 0B
echo.
echo  ======================================================
echo    Pushing Study with HERO to GitHub
echo    Repository: https://github.com/Avazbek0139/Study-with-Herowither
echo  ======================================================
echo.

set "GIT_PATH=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"

if not exist "%GIT_PATH%" (
    where git >nul 2>&1
    if %errorlevel% equ 0 (
        set "GIT_PATH=git"
    ) else (
        echo  [ERROR] Git not found.
        pause
        exit /b 1
    )
)

cd /d "%~dp0"

echo  [1/3] Staging all files...
"%GIT_PATH%" add .

echo.
echo  [2/3] Checking commit...
"%GIT_PATH%" commit -m "Study with HERO full project"

echo.
echo  [3/3] Pushing to GitHub (main branch)...
"%GIT_PATH%" push -u origin main

echo.
if %errorlevel% equ 0 (
    echo  ======================================================
    echo    SUCCESS! Loyiha GitHub'ga muvaffaqiyatli yuklandi!
    echo    Havola: https://github.com/Avazbek0139/Study-with-Herowither
    echo  ======================================================
) else (
    echo  ======================================================
    echo    Eslatma: Agar GitHub parol so'rasa, parolingiz o'rniga
    echo    GitHub Personal Access Token (PAT) dan foydalaning.
    echo  ======================================================
)
echo.
pause
