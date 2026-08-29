# 🦅 SHARPBUY — STEAM ACCOUNT AUDITOR & VALUATION ENGINE
*Спецификация, архитектура и полный реестр собираемых данных*
*Дата составления: 25 августа 2026 г. | Версия: 1.0.0*

---

## 🎯 1. ЦЕЛЬ И НАЗНАЧЕНИЕ СИСТЕМЫ

**SharpBuy Steam Auditor & Valuation Engine** — специализированный аналитический модуль и парсер токенов, предназначенный для:
1. Автоматического входа по сессионным Steam JWT-токенам (`aud: ["client", "web", "renew", "derive"]`) и идентификаторам `SteamID64`.
2. Мгновенного сбора 100% критически важных метрик и скрытых ценностей каждого аккаунта.
3. Автоматического расчета реальной рыночной стоимости аккаунта (Valuation Calculation) на основе балансов, инвентарей CS2/Dota2/TF2/Rust, очков Steam Points, уровня Faceit и библиотеки платных игр.
4. Автоматической категоризации («Жирный инвентарь», «Высокий баланс», «Faceit 10 lvl», «Ветеран 10 лет», «Limited» и т.д.) для последующей дифференцированной перепродажи с максимальной маржой.

---

## 📋 2. ПОЛНЫЙ РЕЕСТР СОБИРАЕМЫХ ДАННЫХ

### 🎮 А. CS2 & Соревновательный статус (Основная ценность)
* **Premier CS2 ELO / Рейтинг:** точный рейтинг (например: `15,420 ELO`, `22,100 ELO`, `Без рейтинга`).
* **CS2 Соревновательные ранги & Победы:** ранги в Matchmaking 5v5 и Wingman (2v2), общее количество побед.
* **Faceit Интеграция (Level 1–10 & ELO):**
  * Проверка регистрации на Faceit по SteamID64.
  * Уровень Faceit (1–10), точное количество ELO, количество матчей, Win Rate.
* **CS2 Медали и Трофеи:**
  * Медали выслуги лет: **5 Year Veteran Coin**, **10 Year Veteran Coin**.
  * Служебные медали по годам (**Service Medal 2015, 2016, 2017 ... 2024** + уровни цвета).
  * Монеты операций (*Operation Bravo, Phoenix, Breakout, Vanguard, Bloodhound, Wildfire, Hydra, Shattered Web, Broken Fang, Riptide*).
  * Турнирные трофеи и значки прогнозов (Pick'Em Trophy: Bronze, Silver, Gold, Diamond).
  * Значки коллекционных пинов (Series 1, 2, 3 Pins).
* **Инвентарь CS2 и Редкости:**
  * Полный список предметов CS2 (`appid: 730, contextid: 2`).
  * Выделение ножей, перчаток, скинов Covert/Classified.
  * Выделение раритетных кейсов (*Bravo Case, Weapon Case 1/2/3, Huntsman, Cobblestone Souvenir Packages*).
  * Float скинов и редкие наклейки (Katowice 2014, Cologne 2014, Crown Foil).
  * Суммарная рыночная стоимость инвентаря CS2 в USD / RUB.

---

### 💰 Б. Финансы, Кошелек и Балансы
* **Текущий баланс кошелька (Wallet Balance):** точная сумма и валюта аккаунта (USD, EUR, RUB, KZT, TRY, CNY, GBP и др.).
* **Pending Баланс:** заблокированные средства (холд после продажи на Торговой Площадке).
* **Общая сумма донатов на аккаунт (Total Spend):** выгрузка через профиль аккаунта суммарного объема потраченных реальных средств за всю историю.
* **Статус Торговой Площадки (Community Market):** активна / заблокирована / временный холд.
* **Статус $5 Лимита (Limited Account):** снято ли ограничение ($5 USD Spend Requirement) или аккаунт ограничен.

---

### 💎 В. Steam Points (Очки Магазина Steam)
* **Текущий баланс очков (Points Balance):** точное число свободных очков.
* **Рыночная оценка очков:** автоматический расчет стоимости (из расчета ~$15 за 100 000 очков).

---

### 📦 Г. Другие игровые дисциплины с экономикой
* **Dota 2 (`appid: 570`):**
  * MMR / Ранг (Herald, Guardian, Crusader, Archon, Legend, Ancient, Divine, Immortal).
  * Инвентарь: наличие предметов качества Arcana, Immortal, эксклюзивные Collector's Cache сеты прошлых боевых пропусков.
  * Суммарная стоимость инвентаря Dota 2.
* **Team Fortress 2 (`appid: 440`):**
  * Наличие предметов качества Unusual, Australium, ящиков Mann Co Supply Crate Keys.
  * Суммарная стоимость инвентаря TF2.
* **Rust (`appid: 252490`):**
  * Наличие платной игры Rust и часов в ней.
  * Инвентарь скинов Rust и их суммарная стоимость.

---

### 🕹️ Д. Библиотека игр и Профиль
* **Общее количество игр в библиотеке.**
* **Топовые платные тайтлы в наличии:** Rust, GTA V, Red Dead Redemption 2, Cyberpunk 2077, DayZ, PUBG Plus, Call of Duty, Forza Horizon, ETS2, Squad, Tarkov (через привязки) и др.
* **Суммарная рыночная стоимость библиотеки игр (Game Value).**
* **Количество игровых часов по ключевым играм (CS2, Dota 2, Rust, GTA V).**
* **Уровень профиля Steam (Steam Level) & Значки (Badges).**
* **Возраст аккаунта и Дата регистрации (Years of Service).**
* **Формат SteamID (Digit):** 5-digit, 6-digit, 7-digit, 8-digit.
* **Аватар, текущий Nickname, кастомный URL.**

---

### 🔒 Е. Безопасность, Регион и Блокировки
* **Регион магазина (Store Country / Currency).**
* **Наличие блокировок:**
  * VAC Ban (с детализацией по забаненным играм).
  * Community Ban.
  * Economy / Trade Ban.
  * Game Bans (разработчиками).
* **Привязка номера телефона (Phone Linked):** `true / false`.
* **Родительский контроль (Family View):** активен ли 4-значный PIN.

---

## 🧮 3. АЛГОРИТМ ОЦЕНКИ СТОИМОСТИ (VALUATION ENGINE)

Общая оценочная стоимость аккаунта рассчитывается по формуле:

$$\text{Total Valuation} = \text{Wallet Balance} + (\text{CS2 Inv} \times 0.85) + (\text{Dota2/TF2/Rust Inv} \times 0.80) + \text{Points Value} + \text{Tier Bonus} + \text{Games Value Bonus}$$

### Автоматические теги-маркеры (Smart Badges):
* 💎 **`HIGH-BALANCE`** — Баланс кошелька > $5.00
* 🔥 **`RICH-INVENTORY`** — Инвентарь CS2 > $15.00
* 🏆 **`FACEIT-HIGH`** — Faceit Level 8-10 / ELO > 1750
* 🥇 **`PREMIER-HIGH`** — Premier CS2 ELO > 15,000
* 🎖️ **`OLD-MEDALS`** — Наличие медалей ветерана 5/10 лет или служебных медалей до 2020 г.
* ⭐️ **`HIGH-POINTS`** — Очки Steam > 30,000 pts
* 👑 **`OLD-SCHOOL`** — Возраст аккаунта > 10 лет
* ⚠️ **`LIMITED`** — Не снят лимит $5

---

## 🏗️ 4. АРХИТЕКТУРА И МОДУЛИ СИСТЕМЫ

### Модули кода:
1. `src/tools/steamAuditor/SteamSession.js` — модуль авторизации и обмена JWT-токена на сессионные куки.
2. `src/tools/steamAuditor/Collectors/WalletCollector.js` — сбор баланса, региона и валюты.
3. `src/tools/steamAuditor/Collectors/InventoryCollector.js` — парсинг инвентарей CS2/TF2/Dota2/Rust и оценка предметов по рынку.
4. `src/tools/steamAuditor/Collectors/FaceitCollector.js` — опрос Faceit API на ранг, ELO и уровень.
5. `src/tools/steamAuditor/Collectors/GamesCollector.js` — парсинг библиотеки игр, часов и медалей.
6. `src/tools/steamAuditor/ValuationEngine.js` — расчет формулы цены, присвоение бейджей и маржинальности.
7. `src/tools/steamAuditor/DashboardView.jsx` — визуальный веб-интерфейс со сводной таблицей, фильтрами и карточками.
8. `scripts/audit_tokens_cli.js` — автономный быстрый скрипт для терминала.

---

## 📌 5. ФОРМАТ ВХОДНЫХ И ВЫХОДНЫХ ДАННЫХ

### Входной формат (Input Token):
```text
76561199001354473----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiw...
```

### Выходной структурированный объект (Output JSON):
```json
{
  "steamid": "76561199001354473",
  "persona_name": "PlayerName",
  "avatar": "https://avatars.steamstatic.com/...",
  "profile_url": "https://steamcommunity.com/profiles/76561199001354473",
  "wallet": {
    "balance": 4.50,
    "currency": "USD",
    "formatted": "$4.50 USD",
    "is_limited": false
  },
  "steam_points": 45200,
  "level": 14,
  "account_age_years": 6,
  "faceit": {
    "registered": true,
    "level": 8,
    "elo": 1820,
    "matches": 412
  },
  "cs2": {
    "premier_elo": 16400,
    "medals": ["2018 Service Medal", "5 Year Veteran Coin"],
    "inventory_count": 42,
    "inventory_worth_usd": 78.40,
    "top_items": [
      { "name": "AK-47 | Redline (Field-Tested)", "price_usd": 18.50 },
      { "name": "Operation Bravo Case", "price_usd": 48.00 }
    ]
  },
  "games": {
    "total_count": 18,
    "top_games": ["Rust", "Grand Theft Auto V", "Counter-Strike 2"],
    "library_worth_usd": 120.00
  },
  "security": {
    "vac_banned": false,
    "community_banned": false,
    "trade_banned": false
  },
  "valuation": {
    "estimated_worth_usd": 96.20,
    "suggested_sale_price_rub": 8500,
    "badges": ["RICH-INVENTORY", "FACEIT-HIGH", "HIGH-POINTS", "PREMIER-HIGH"]
  }
}
```
