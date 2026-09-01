@echo off
title Extract ALL Steam tokens (this PC only)
cd /d "%~dp0"
echo.
echo Extracts every Steam session saved on THIS computer.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0extract_steam_token.ps1" -All -CopyClipboard
echo.
pause
