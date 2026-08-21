@echo off
title Deploy Study with HERO to Vercel
color 0B
echo.
echo  ======================================================
echo    Deploying Study with HERO to Vercel
echo  ======================================================
echo.
echo  [1/2] Vercel tizimiga ulanish va yuklash boshlanmoqda...
echo.

cd /d "%~dp0"

call npx vercel --prod

echo.
if %errorlevel% equ 0 (
    echo  ======================================================
    echo    SUCCESS! Loyiha Vercel'ga muvaffaqiyatli yuklandi!
    echo  ======================================================
) else (
    echo  ======================================================
    echo    Vercel buyrug'i yakunlandi.
    echo  ======================================================
)
echo.
pause
