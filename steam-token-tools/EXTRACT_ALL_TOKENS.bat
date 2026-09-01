@echo off
chcp 65001 >nul
title Достать ВСЕ Steam токены
cd /d "%~dp0"

if not exist "%~dp0extract_steam_token.ps1" (
    echo.
    echo ОШИБКА: не найден extract_steam_token.ps1
    echo Скинь ВСЮ папку SteamTokenTools целиком!
    echo.
    pause
    exit /b 1
)

echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0extract_steam_token.ps1" -All -CopyClipboard
echo.
pause
