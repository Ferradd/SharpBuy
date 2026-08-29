@echo off
title SharpBuy - Extract My Steam Token
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0extract_steam_token.ps1" -CopyClipboard
echo.
pause
