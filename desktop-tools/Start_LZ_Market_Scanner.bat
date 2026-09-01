@echo off
title LZ Market Scanner
cls
cd /d "C:\Users\iliyk\Desktop\lzt_analyzer"
start "" "http://localhost:8080/"
echo ========================================================
echo   Starting LZ Market Scanner (http://localhost:8080)
echo ========================================================
echo.
echo Proxy Server running on http://localhost:8080 ...
echo Close this window or press Ctrl+C to stop.
echo.
python server.py
pause
