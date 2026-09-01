@echo off
chcp 65001 >nul
title Достать СВОЙ Steam токен
cd /d "%~dp0"

if not exist "%~dp0extract_steam_token.ps1" (
    echo.
    echo ОШИБКА: не найден extract_steam_token.ps1
    echo.
    echo Нужно скинуть ВСЮ папку SteamTokenTools, не один батник!
    echo В папке должны быть 2 файла: .bat и .ps1
    echo.
    pause
    exit /b 1
)

echo.
echo Достаём токен из Steam на ЭТОМ компьютере...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0extract_steam_token.ps1" -CopyClipboard
echo.
pause
