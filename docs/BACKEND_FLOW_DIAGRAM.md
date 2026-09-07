# SharpBuy Backend Flow Diagram

## Полная цепочка событий от оплаты до доставки

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          1. КЛИЕНТ НАЧИНАЕТ ЗАКАЗ                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend: CryptoPayModal.jsx                                               │
│  - Клиент выбирает товар (productId, productName, quantity)                 │
│  - Клиент вводит email                                                       │
│  - Клиент выбирает способ оплаты: 'crypto' или 'balance'                    │
│  - Для crypto: клиент выбирает USDT_BEP20                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend: Формирование запроса /api/create-order                            │
│  POST /api/create-order                                                       │
│  Body: {                                                                     │
│    productId, productName, quantity, email, priceRub,                        │
│    paymentMode: 'crypto',                                                    │
│    currency: 'USDT_BEP20'                                                    │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend: api/create-order.js                                                │
│  - Генерирует уникальный orderId                                             │
│  - Рассчитывает cryptoAmount = priceRub / 92                                 │
│  - Генерирует крипто-адрес для оплаты:                                       │
│    • Для main wallet: 0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1             │
│    • Для child wallet: уникальный адрес через deposit API                    │
│  - Записывает initialBalance (для delta tracking)                            │
│  - Возвращает: { orderId, address, cryptoAmount, currency, initialBalance }   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend: Отображение экрана оплаты (PAYING)                               │
│  - Показывает QR-код с адресом и суммой                                      │
│  - Запускает polling каждые 3 секунды: /api/check-payment                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          2. КЛИЕНТ ПЕРЕВОДИТ USDT                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Клиент переводит USDT на адрес из QR-кода через BSC                        │
│  - Сеть: BSC (BEP-20)                                                        │
│  - Контракт: 0x55d398326f99059fF775485246999027B3197955 (USDT)              │
│  - Сумма: точно как указано (или с небольшой погрешностью)                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend: Polling /api/check-payment (каждые 3 сек)                         │
│  POST /api/check-payment                                                      │
│  Body: {                                                                     │
│    orderId, address, expectedAmount, symbol: 'USDT',                          │
│    currency: 'USDT_BEP20', initialBalance, email, productId,                 │
│    productName, quantity, priceRub                                           │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend: api/check-payment.js - ПРОВЕРКА ОПЛАТЫ                            │
│                                                                             │
│  Шаг 1: Проверка кэша fulfilledOrdersCache                                   │
│  - Если orderId уже в кэше → возвращаем DELIVERED немедленно                │
│                                                                             │
│  Шаг 2: Проверка базы данных orders_database.json                            │
│  - Если заказ уже существует и delivered → возвращаем DELIVERED               │
│  - Если заказ PROCURING → переходим к проверке поставщика (см. ниже)         │
│                                                                             │
│  Шаг 3: Проверка крипто-оплаты через RPC                                     │
│  - Для USDT_BEP20:                                                          │
│    • Подключается к BSC RPC endpoints (bsc-dataseed1.binance.org и др.)    │
│    • Вызывает eth_call для контракта USDT (balanceOf)                       │
│    • Получает текущий баланс кошелька                                       │
│    • Для main wallet: проверяет delta = currentBalance - initialBalance     │
│    • Проверяет: delta >= expectedAmount - 0.02 (допуск на комиссии)        │
│    • Для child wallet: проверяет currentBalance >= expectedAmount - 0.05    │
│  - Если порог пройден → isPaid = true                                      │
│  - Генерирует txHash (например: 0xBSC_MAIN_orderId)                         │
│  - Проверяет, что txHash не был использован (used_tx_hashes.json)          │
│                                                                             │
│  Шаг 4: ОПЛАТА ПОДТВЕРЖДЕНА                                                  │
│  - Добавляет orderId в fulfilledOrdersCache                                  │
│  - Сохраняет txHash в used_tx_hashes.json                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend: api/check-payment.js - ДРОПШИППИНГ (ПОКУПКА У ПОСТАВЩИКА)         │
│                                                                             │
│  Шаг 5: Инициация дропшиппинга                                               │
│  - Вызывает initiateDropshipPurchase(productSlug, userEmail)                │
│  - productSlug = mapToSupplierSlug(productId, productName)                 │
│                                                                             │
│  Функция initiateDropshipPurchase (api/_utils/shefu-dropship.js):          │
│  - POST запрос к https://shefu223.shop/api/nfa-checkout-crypto              │
│  - Body: { items: [{ product: productSlug, quantity: 1 }], email }         │
│  - Получает ответ: { url, order_id }                                       │
│  - Извлекает iid из URL параметров                                          │
│  - Запрашивает адрес оплаты через NOWPayments API:                           │
│    • POST https://api.nowpayments.io/v1/invoice-payment                     │
│    • Headers: { x-api-key: NOWPAYMENTS_API_KEY }                            │
│    • Body: { iid, pay_currency: 'usdtbsc' }                                 │
│  - Получает: { pay_address, pay_amount }                                    │
│  - Создает кошелек из MERCHANT_MNEMONIC (ethers.Wallet.fromPhrase)          │
│  - Создает контракт USDT на BSC                                            │
│  - Отправляет USDT на pay_address поставщика:                               │
│    • usdtContract.transfer(pay_address, amountWei)                          │
│  - Ждет 1 подтверждение в блокчейне (tx.wait(1))                            │
│  - Возвращает: { success: true, supplierOrderId, txHash, blockNumber }      │
│                                                                             │
│  Шаг 6: Сохранение заказа в БД                                              │
│  - saveOrderToDb({                                                           │
│      orderId, email, productId, productName, quantity,                       │
│      amountRub, cryptoAmount, currency, txHash,                             │
│      tokens: ['PROCURING'], supplierOrderId, warrantyHours: 3              │
│    })                                                                       │
│                                                                             │
│  Шаг 7: Быстрая проверка поставщика (6 попыток по 4 сек)                    │
│  - Вызывает checkAndFulfillSupplierOrder(                                   │
│      supplierOrderId, orderId, userEmail, priceRub, cryptoAmount,          │
│      currency, productName, quantity                                       │
│    )                                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend: api/_utils/shefu-dropship.js - ПРОВЕРКА ПОСТАВЩИКА                │
│                                                                             │
│  Функция checkAndFulfillSupplierOrder:                                      │
│  - Вызывает getSupplierOrderStatus(supplierOrderId)                         │
│                                                                             │
│  Функция getSupplierOrderStatus:                                            │
│  - Параллельно два запроса к shefu223.shop:                                 │
│    • POST /api/nfa-downloads { nfa_order: supplierOrderId }                  │
│    • GET /api/nfa-crypto-status?order=supplierOrderId                       │
│  - Если dlData.status === 'fulfilled' и есть keys → fulfilled = true        │
│  - Иначе: { status: 'pending'/'processing', fulfilled: false }              │
│                                                                             │
│  Если fulfilled = true:                                                     │
│  - Извлекает первый ключ: deliveredKey = dlData.keysByProduct[0].keys[0]  │
│  - Вызывает redeemShefuKey(deliveredKey)                                    │
│                                                                             │
│  Функция redeemShefuKey:                                                     │
│  - POST https://nfa.shefu223.shop/api/nfa-redeem                            │
│  - Body: { license: deliveredKey }                                          │
│  - Если в ответе есть account сразу → возвращаем account                    │
│  - Если в ответе есть claim_id → поллинг статуса (60 попыток по 2.5 сек)    │
│    • POST /api/nfa-redeem-status { claim_id }                               │
│    • Ждем status === 'approved' и account                                   │
│  - Возвращает: { success: true, account, loader_token }                    │
│                                                                             │
│  Если redeem успешен:                                                        │
│  - finalToken = account (реальный Steam токен)                              │
│  - updateOrderDeliveryInDb(orderId, finalToken)                             │
│  - Вызывает sendOrderEmail(...)                                             │
│  - Возвращает: { delivered: true, token: finalToken, licenseKey }          │
│                                                                             │
│  Если не fulfilled:                                                          │
│  - Возвращает: { delivered: false, supplierStatus, supplierMessage }       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend: api/_utils/email-sender.js - ОТПРАВКА EMAIL                        │
│                                                                             │
│  Функция sendOrderEmail:                                                     │
│  - Проверяет валидность email (простой regex)                               │
│  - Проверяет дубликаты:                                                       │
│    • Если order.emailSentAt существует → пропускаем                          │
│    • Если orderId в sentEmailOrders кэше → пропускаем                        │
│  - Формирует HTML template с:                                                │
│    • Order ID                                                                │
│    • Product name                                                            │
│    • Quantity                                                                │
│    • Amount in RUB                                                          │
│    • Crypto amount                                                           │
│    • Token/Steam account                                                     │
│    • Launcher download link                                                  │
│  - Отправляет через Resend API:                                             │
│    • POST https://api.resend.com/emails                                     │
│    • Headers: { Authorization: Bearer RESEND_API_KEY }                      │
│    • Body: {                                                                │
│        from: 'SharpBuy Orders <orders@sharpbuy.org>',                        │
│        to: userEmail,                                                        │
│        subject: 'Your SharpBuy Order',                                      │
│        html: template                                                       │
│      }                                                                      │
│  - Если успешно (status 200):                                               │
│    • Логирует: '[Email] [info] Email sent successfully'                     │
│    • Добавляет orderId в sentEmailOrders                                     │
│    • markOrderEmailSent(orderId) → записывает emailSentAt в БД               │
│    • Возвращает: { success: true, id: resendId }                           │
│  - Если ошибка:                                                             │
│    • Логирует: '[Email] [error] Failed to send email'                        │
│    • Возвращает: { success: false, error }                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend: api/check-payment.js - ВОЗВРАТ ОТВЕТА ФРОНТЕНДУ                    │
│                                                                             │
│  Если дропшиппинг успешен и ключ получен:                                   │
│  - Возвращает: {                                                             │
│      paid: true,                                                             │
│      status: 'DELIVERED',                                                    │
│      txHash,                                                                 │
│      delivery: {                                                             │
│        quantity,                                                             │
│        tokens: [finalToken],                                                 │
│        tokenData: finalToken,                                                │
│        status: 'DELIVERED',                                                  │
│        launcherUrl: '/SharpBuy_Launcher.exe',                                │
│        launcherName: 'SharpBuy_Launcher.exe'                                │
│      },                                                                     │
│      orderId                                                                 │
│    }                                                                       │
│                                                                             │
│  Если дропшиппинг в процессе (PROCURING):                                   │
│  - Возвращает: {                                                             │
│      paid: true,                                                             │
│      status: 'PROCURING',                                                    │
│      supplierOrderId,                                                        │
│      orderId                                                                 │
│    }                                                                       │
│  - Frontend продолжает polling каждые 3 сек                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend: Отображение результата                                            │
│                                                                             │
│  Если DELIVERED:                                                             │
│  - Показывает экран SUCCESS                                                 │
│  - Отображает токен/аккаунт                                                  │
│  - Предлагает скачать лаунчер                                               │
│  - Сохраняет заказ в localStorage                                            │
│                                                                             │
│  Если PROCURING:                                                             │
│  - Показывает экран PROCURING с прогрессом                                   │
│  - Продолжает polling каждые 3 сек                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    3. BACKGROUND RECOVERY (ФОНОВОЕ ВОССТАНОВЛЕНИЕ)          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend: api/_utils/fulfillment-worker.js (каждые 15 сек)                 │
│                                                                             │
│  Сканирует orders_database.json:                                             │
│  - Заказы со статусом 'PROCURING'                                             │
│  - Заказы с supplierOrderId но без tokens                                    │
│  - Заказы delivered но без emailSentAt                                      │
│                                                                             │
│  Для каждого PROCURING заказа:                                               │
│  - Вызывает checkAndFulfillSupplierOrder(...)                               │
│  - Если поставщик fulfilled → redeem → email → обновить БД                  │
│  - Если заказ застрял (> 5 минут) → отправляет alert на ADMIN_EMAIL          │
│                                                                             │
│  Для каждого delivered заказа без email:                                    │
│  - Вызывает sendOrderEmail(..., { forceEmail: true })                       │
│  - Пропускает проверку дубликатов через forceEmail                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    4. WALLET BALANCE PAYMENT (ОПЛАТА С БАЛАНСА)            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Frontend: paymentMode = 'balance'                                           │
│  - Клиент авторизован с user.balance                                         │
│  - Пропускает шаг оплаты (нет крипто-перевода)                              │
│  - Сразу вызывает /api/check-payment с currency: 'WALLET_BALANCE'            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Backend: api/check-payment.js - BALANCE FLOW                                │
│  - currency === 'WALLET_BALANCE' → пропускает крипто-проверку               │
│  - Сразу переходит к дропшиппинг (Шаг 5 выше)                                │
│  - Остальной поток идентичен                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Ключевые точки безопасности

1. **Idempotency (Идемпотентность):**
   - fulfilledOrdersCache предотвращает повторную обработку
   - used_tx_hashes.json предотвращает повторное использование транзакций
   - sentEmailOrders кэш предотвращает дубликатные email

2. **Persistence (Сохранение состояния):**
   - orders_database.json хранит все заказы
   - emailSentAt помечает отправленные email
   - supplierOrderId привязывает к заказу поставщика

3. **Background Recovery (Фоновое восстановление):**
   - fulfillment-worker.js сканирует каждые 15 сек
   - Восстанавливает застрявшие заказы
   - Отправляет пропущенные email

4. **No Fake Stock (Нет фейкового стока):**
   - Для dropship продуктов локальный сток отключен
   - Только реальный ключ от поставщика → Steam токен → клиент

## Environment Variables (Переменные окружения)

```
RESEND_API_KEY          - API ключ для Resend email
NOWPAYMENTS_API_KEY     - API ключ для NOWPayments (оплата поставщика)
MERCHANT_MNEMONIC       - Мнемоника кошелька мерчанта (оплата поставщика)
ADMIN_EMAIL             - Email для алертов о застрявших заказах
JWT_SECRET              - Секрет для JWT токенов авторизации
```

## Critical Dependencies (Критические зависимости)

1. **BSC RPC endpoints** - для проверки USDT транзакций
2. **shefu223.shop API** - для создания заказов и получения ключей
3. **nfa.shefu223.shop API** - для активации ключей в Steam токены
4. **NOWPayments API** - для получения адреса оплаты поставщика
5. **Resend API** - для отправки email

## Failure Points (Точки отказа)

1. **BSC RPC down** - оплата не будет подтверждена
2. **shefu223.shop down** - невозможно создать заказ у поставщика
3. **NOWPayments down** - невозможно оплатить поставщика
4. **MERCHANT_MNEMONIC missing/invalid** - оплата поставщика не пройдет
5. **Wallet has no USDT** - оплата поставщика не пройдет
6. **Resend down** - email не будет отправлен (но токен выдан)
7. **nfa.shefu223.shop down** - ключ не будет активирован в токен
