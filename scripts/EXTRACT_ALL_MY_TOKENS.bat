@echo off
title SharpBuy - Extract ALL My Tokens
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0extract_steam_token.ps1" -All -CopyClipboard
echo.
pause
