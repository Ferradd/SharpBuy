#!/bin/bash
# ==========================================================
# LZT Smart Analyzer — Quick Start for macOS / MacBook
# ==========================================================

cd "$(dirname "$0")"

echo "=================================================="
echo "  🚀 Запуск LZT Smart Analyzer на macOS / MacBook"
echo "=================================================="

# Check for Python 3
if command -v python3 &>/dev/null; then
    PYTHON_CMD=python3
elif command -v python &>/dev/null; then
    PYTHON_CMD=python
else
    echo "❌ Ошибка: Python 3 не найден. Пожалуйста, установите Python с python.org или brew install python"
    exit 1
fi

# Check requests package
$PYTHON_CMD -c "import requests" &>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Установка необходимых зависимостей (requests)..."
    $PYTHON_CMD -m pip install requests
fi

echo "🟢 Запуск локального сервера LZT Smart Analyzer на порту 8080..."
echo "👉 Откройте в браузере: http://localhost:8080"
echo "=================================================="

# Open browser automatically after 1.5 seconds in background
(sleep 1.5 && open "http://localhost:8080") &

# Start server
$PYTHON_CMD server.py
