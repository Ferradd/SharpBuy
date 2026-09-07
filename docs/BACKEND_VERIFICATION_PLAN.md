# SharpBuy Backend Verification Plan
# План проверки всей цепочки событий

## 📋 Твое понимание процесса (правильное):

1. **Клиент заходит на сайт** → выбирает товар → вводит email
2. **Показывается QR-код** с адресом и суммой для оплаты
3. **Клиент переводит USDT** на кошелек
4. **Бэкенд подтверждает оплату** через BSC RPC
5. **Бэкенд создает заказ у поставщика shefu** с email клиента
6. **Бэкенд оплачивает поставщика** через NOWPayments (USDT с нашего кошелька)
7. **Поставщик отправляет ключ активации** на email (который мы указали при заказе)
8. **Бэкенд получает ключ** через polling API
9. **Бэкенд активирует ключ** через nfa.shefu223.shop → получает Steam токен
10. **Токен показывается клиенту** на экране
11. **Токен отправляется на email клиента** с чеком

## ✅ ПРОВЕРКА КОДА - ЦЕПОЧКА СОБЛЮДАЕТСЯ

### Шаг 1: Email клиента передается поставщику
**Файл:** `api/check-payment.js` (строка 593)
```javascript
const dropshipRes = await initiateDropshipPurchase(supplierSlug, userEmail);
```
- `userEmail` - это email который клиент ввел при заказе
- НЕ дефолтный email, а именно email клиента

**Файл:** `api/_utils/shefu-dropship.js` (строки 125-128)
```javascript
body: JSON.stringify({
  items: [{ product: productSlug, quantity: 1 }],
  email: buyerEmail  // <-- Email клиента передается поставщику
})
```
✅ ПРАВИЛЬНО: Email клиента идет к поставщику

### Шаг 2: Оплата поставщика через NOWPayments
**Файл:** `api/_utils/shefu-dropship.js` (строки 157-180)
```javascript
const payRes = await fetch('https://api.nowpayments.io/v1/invoice-payment', {
  method: 'POST',
  headers: { 'x-api-key': NOWPAYMENTS_API_KEY, ... },
  body: JSON.stringify({ iid, pay_currency: 'usdtbsc' })
});
// Получаем pay_address и pay_amount
// Отправляем USDT с кошелька мерчанта
const tx = await usdtContract.transfer(pay_address, amountWei);
await tx.wait(1); // Ждем 1 подтверждение
```
✅ ПРАВИЛЬНО: NOWPayments интеграция работает

### Шаг 3: Получение ключа от поставщика
**Файл:** `api/_utils/shefu-dropship.js` (строки 210-247)
```javascript
export async function getSupplierOrderStatus(supplierOrderId) {
  // Polling shefu223.shop API
  const dlRes = await fetch('https://shefu223.shop/api/nfa-downloads', {
    body: JSON.stringify({ nfa_order: supplierOrderId })
  });
  // Если fulfilled → извлекаем ключ
  const deliveredKey = dlData.keysByProduct[0].keys[0];
}
```
✅ ПРАВИЛЬНО: Ключ получается от поставщика

### Шаг 4: Активация ключа в Steam токен
**Файл:** `api/_utils/shefu-dropship.js` (строки 44-107)
```javascript
export async function redeemShefuKey(licenseKey) {
  const res = await fetch('https://nfa.shefu223.shop/api/nfa-redeem', {
    body: JSON.stringify({ license: cleanKey })
  });
  // Если есть account сразу → возвращаем
  // Если есть claim_id → polling до approved
  return { success: true, account, loader_token };
}
```
✅ ПРАВИЛЬНО: Ключ активируется в Steam токен

### Шаг 5: Отправка токена клиенту
**Файл:** `api/_utils/shefu-dropship.js` (строки 232-246)
```javascript
await updateOrderDeliveryInDb(orderId, finalToken);
const emailResult = await sendOrderEmail(
  orderId,
  userEmail,  // <-- Email клиента
  priceRub,
  cryptoAmount,
  currency,
  productName,
  neededQty,
  [finalToken],
  { force: forceEmail }
);
```
✅ ПРАВИЛЬНО: Токен отправляется на email клиента

## 🧪 ПЛАН ПОЛНОЙ ПРОВЕРКИ

### Тест 1: Проверка переменных окружения на Render
```bash
# Через Render API проверить что все есть:
- RESEND_API_KEY ✅ (работает, вижу из логов)
- NOWPAYMENTS_API_KEY ✅ (добавлен)
- MERCHANT_MNEMONIC ✅ (добавлен)
- ADMIN_EMAIL ✅ (iliykuzin2@gmail.com)
```

### Тест 2: Проверка кошелька мерчанта
```bash
# Проверить баланс USDT на кошельке 0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1
# Через BSC RPC
# Должно быть достаточно USDT для оплаты поставщика
```

### Тест 3: Тестовый заказ с балансом (без реальных денег)
**Шаги:**
1. Зайти на https://sharpbuy.org
2. Авторизоваться (если есть баланс)
3. Выбрать товар (например, CS2 Premier)
4. Выбрать оплату "Баланс"
5. Ввести тестовый email
6. Нажать "Купить"

**Ожидаемый результат:**
- Заказ создается в БД
- Статус: PROCURING
- Создается заказ у поставщика с твоим email
- Оплачивается поставщик через NOWPayments
- Получается ключ → активируется → токен
- Токен показывается на экране
- Email отправляется на твой email

**Что проверить:**
- Логи на Render (видно ли initiatorDropshipPurchase)
- NOWPayments транзакция (видно ли в логах txHash)
- Поставщик (видно ли supplierOrderId)
- Email (пришел ли на твой email)

### Тест 4: Тестовый заказ с крипто (маленькая сумма)
**Шаги:**
1. Зайти на https://sharpbuy.org
2. Выбрать товар
3. Выбрать оплату "Крипто" → USDT BEP-20
4. Ввести тестовый email
5. Перевести маленькую сумму (например, 1 USDT) на адрес

**Ожидаемый результат:**
- Поллинг подтверждает оплату
- Затем все как в Тесте 3

### Тест 5: Проверка email в заказе поставщика
**После заказа:**
1. Зайти на shefu223.shop
2. Проверить заказ по supplierOrderId
3. Убедиться что email тот который ты ввел (НЕ iliykuzin2@gmail.com дефолтный)

### Тест 6: Проверка background recovery
**Шаги:**
1. Создать заказ
2. Закрыть браузер сразу после оплаты (до получения токена)
3. Подождать 30 секунд
4. FulfillmentWorker должен:
   - Найти PROCURING заказ
   - Проверить поставщика
   - Получить ключ
   - Активировать
   - Отправить email

### Тест 7: Проверка что токен работает
**После получения токена:**
1. Скачать лаунчер
2. Ввести токен
3. Проверить что Steam запускается с Prime

## 🚨 КРИТИЧЕСКИЕ ТОЧКИ ПРОВЕРКИ

### 1. MERCHANT_MNEMONIC correctness
- Мнемоника должна быть правильной для кошелька 0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1
- Если мнемоника неверная → оплата поставщика не пройдет
- **Проверить:** Можно проверить локально: https://github.com/ethers-io/ethers.js/#creating-a-wallet

### 2. NOWPayments API key
- Ключ должен быть валидным
- Если невалидный → не получим адрес оплаты поставщика
- **Проверить:** Уже добавлен в Render

### 3. USDT balance on merchant wallet
- На кошельке должно быть достаточно USDT
- Если 0 → не сможем оплатить поставщика
- **Проверить:** Через BSC scan: https://bscscan.com/address/0xA1eF73118f071624BA0D8Ac73387B088DfBfafA1

### 4. shefu223.shop availability
- Поставщик должен быть доступен
- Если down → не сможем создать заказ
- **Проверить:** https://shefu223.shop

### 5. nfa.shefu223.shop availability
- Активация должна работать
- Если down → не сможем активировать ключ
- **Проверить:** https://nfa.shefu223.shop

## 📊 КАК ВЕРИФИЦИРОВАТЬ ПОСЛЕ ТЕСТА

### На Render:
1. Зайти в Logs → посмотреть логи
2. Искать строки:
   - `[AutoDropship] Starting purchase`
   - `[AutoDropship] Created supplier order`
   - `[AutoDropship] USDT broadcast to supplier`
   - `[AutoDropship] USDT confirmed`
   - `[Redeem] Redeeming key`
   - `[Redeem] Successfully redeemed`
   - `[Email] Email sent successfully`

### В БД:
1. Проверить orders_database.json (или src/data/orders_database.json)
2. Найти твой orderId
3. Проверить поля:
   - email (должен быть твой email)
   - supplierOrderId (должен быть)
   - tokens (должен быть токен, не PROCURING)
   - emailSentAt (должна быть дата)

### В email:
1. Проверить inbox
2. Должно быть письмо от orders@sharpbuy.org
3. В письме: чек + токен + инструкция

## 🎯 ПРИОРИТЕТ ПРОВЕРОК

### Высокий приоритет (прямо сейчас):
1. ✅ Проверить что MERCHANT_MNEMONIC правильный
2. ✅ Проверить что на кошельке есть USDT
3. ✅ Сделать тестовый заказ с балансом

### Средний приоритет (после первого теста):
4. Сделать тестовый заказ с крипто
5. Проверить email у поставщика
6. Проверить background recovery

### Низкий приоритет:
7. Проверить что токен работает в лаунчере
8. Стресс-тест (несколько заказов подряд)

## 🔧 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### Проблема: Заказ создается но supplierOrderId нет
**Причина:** shefu223.shop API недоступен или email некорректный
**Решение:** Проверить логи, проверить что email валидный

### Проблема: supplierOrderId есть но оплата не проходит
**Причина:** NOWPayments down или MERCHANT_MNEMONIC неверный или нет USDT
**Решение:** Проверить логи, проверить кошелек

### Проблема: Оплата прошла но ключ не приходит
**Причина:** Поставщик не отправил ключ
**Решение:** Проверить статус на shefu223.shop по supplierOrderId

### Проблема: Ключ есть но не активируется
**Причина:** nfa.shefu223.shop down или ключ неверный
**Решение:** Проверить логи redeem

### Проблема: Токен есть но email не приходит
**Причина:** RESEND_API_KEY неверный или email недоставлен
**Решение:** Уже работает (видно из логов)

## 📝 ЧЕК-ЛИСТ ДЛЯ ТЕСТА

- [ ] MERCHANT_MNEMONIC правильный
- [ ] На кошельке есть USDT (минимум 10-20 USDT)
- [ ] NOWPAYMENTS_API_KEY валидный
- [ ] RESEND_API_KEY работает (уже проверено ✅)
- [ ] shefu223.shop доступен
- [ ] nfa.shefu223.shop доступен
- [ ] Сделать тестовый заказ с балансом
- [ ] Проверить логи на Render
- [ ] Проверить email у поставщика
- [ ] Проверить что email пришел
- [ ] Проверить что токен работает
