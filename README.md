# SharpBuy NFA Launcher

SharpBuy - сервис для покупки и управления Steam NFA (Non-Full Access) аккаунтов.

## macOS Launcher

Для macOS доступен Electron-версия лаунчера со встроенным браузером:

- **Размер**: ~234 MB (встроенный Chromium)
- **Платформа**: macOS 12.0+
- **Архитектура**: arm64 (Apple Silicon)
- **Функционал**: Внедрение Steam токенов, управление аккаунтами, проверка валидности

### Скачивание

Скачайте DMG с сайта SharpBuy (https://sharpbuy.org) в разделе инструкции.

### Особенности

- Использует Electron (Chromium + Node.js) для кроссплатформенности
- Встроенный браузер обеспечивает полную совместимость с Windows версией
- Шифрование AES-256-CBC для macOS Steam сессий
- Полная визуализация как в Windows версии

### Важно о размере

Приложение весит ~234 MB из-за встроенного Chromium в Electron. Это стандартный размер для Electron приложений. Tauri альтернатива (~8 MB) была протестирована, но имеет проблемы с визуализацией.

### Установка

1. Скачайте DMG файл из Releases
2. Откройте DMG файл
3. Перетащите `SharpBuy Launcher.app` в папку Applications
4. Запустите приложение

### Разработка

## Backend API
- **Framework**: Next.js
- **Runtime**: Node.js
- **Database**: Vercel Blob
- **Payments**: NowPayments (USDT BEP-20)

## Launcher
- **Windows**: C# + WebView2
- **macOS**: Electron (JavaScript + Node.js)
- **Backend**: SharpBuy API

## License
Private - All rights reserved
