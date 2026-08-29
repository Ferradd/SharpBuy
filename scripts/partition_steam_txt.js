import fs from 'fs';

// Read JSON audit report
const reportData = JSON.parse(fs.readFileSync('C:\\Users\\iliyk\\Desktop\\SharpBuy\\src\\data\\commercial_titles_audit_report.json', 'utf8'));

const deadIds = new Set(['76561199222229128', '76561199250626158']);

const activeAccounts = reportData.accounts.filter(a => !deadIds.has(a.steamid));
const deadAccounts = reportData.accounts.filter(a => deadIds.has(a.steamid));

// Generate Clean steam.txt
let steamTxtContent = `================================================================================
  🟢 SHARPBUY ACTIVE STEAM ACCOUNTS (ТОЛЬКО РАБОЧИЙ ВАЛИДНЫЙ СТОК)
  Всего активных аккаунтов: ${activeAccounts.length} | Дата: ${new Date().toLocaleDateString('ru-RU')}
================================================================================\n\n`;

activeAccounts.forEach((a, idx) => {
  const c = a.commercialSummary || {};
  const v = a.valuation || {};
  steamTxtContent += `#${idx + 1} | [${a.nickname}] [SteamID: ${a.steamid}] [Lv ${a.steamLevel}]
📦 Статус: CS2 Prime + Premier Ready | Часы CS2: ${Math.round(c.hours || 0)}ч
🎮 Игры: ${c.marksSummary || 'CS2 Prime'}
💵 Оценка: $${v.estimatedWorthUsd || 0} USD (~${v.suggestedSalePriceRub || 89} ₽)
🔗 Профиль: https://steamcommunity.com/profiles/${a.steamid}/
TOKEN:
${a.token}\n\n`;
});

steamTxtContent += `================================================================================
  🔴 АРХИВ / НЕВАЛИД / БАНЫ (ВЫВЕДЕНЫ ИЗ АКТИВНОЙ ПРОДАЖИ)
================================================================================\n\n`;

deadAccounts.forEach((a, idx) => {
  const note = a.steamid === '76561199222229128' ? '❌ СЕССИЯ СБРОШЕНА / NO WORK' : '🔒 БАН СООБЩЕСТВА 160 ДНЕЙ';
  steamTxtContent += `[АРХИВ #${idx + 1}] [SteamID: ${a.steamid}] | Ник: "${a.nickname}"
⚠️ ПРИЧИНА: ${note}
TOKEN:
${a.token}\n\n`;
});

fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\steam.txt', steamTxtContent, 'utf8');
console.log('Cleaned and partitioned steam.txt written successfully!');
