@echo off
title Extract MY Steam token (this PC only)
cd /d "%~dp0"
echo.
echo This extracts a token from Steam on THIS computer.
echo It does NOT use a token sent from someone else.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0extract_steam_token.ps1" -CopyClipboard
echo.
pause
