@echo off
title SHARPBUY - sharpbuy.org
cls
cd /d "%~dp0.."
if exist "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" (
    start "" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" "http://localhost:5173/"
) else (
    start "" "http://localhost:5173/"
)
echo ========================================================
echo   Starting SHARPBUY Web Store in BRAVE Browser
echo   Domain: sharpbuy.org (Online) / localhost:5173 (Dev)
echo ========================================================
echo.
echo Dev server running on http://localhost:5173 ...
echo.
call npm.cmd run dev
pause
