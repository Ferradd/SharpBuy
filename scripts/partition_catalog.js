import fs from 'fs';

const reportData = JSON.parse(fs.readFileSync('C:\\Users\\iliyk\\Desktop\\SharpBuy\\src\\data\\commercial_titles_audit_report.json', 'utf8'));

const deadIds = new Set(['76561199222229128', '76561199250626158']);
const activeAccounts = reportData.accounts.filter(a => !deadIds.has(a.steamid));
const deadAccounts = reportData.accounts.filter(a => deadIds.has(a.steamid));

let catalog = `================================================================================
  🦅 SHARPBUY — КАТАЛОГ КОММЕРЧЕСКИХ ТАЙТЛОВ (ВАЛИДНЫЙ СТОК)
================================================================================
Всего активных аккаунтов: ${activeAccounts.length}
С платными играми: ${activeAccounts.filter(a => a.commercialSummary?.hasNonPrimeTitles).length}
Дата аудита: ${new Date().toLocaleDateString('ru-RU')}
================================================================================\n\n`;

activeAccounts.forEach((a, i) => {
  const c = a.commercialSummary || {};
  const v = a.valuation || {};
  const titles = (c.titles || []).map(t => `   • ${t.name} (MSRP: $${t.basePriceUsd} | Оценка: +$${t.resaleValueUsd}${t.hours > 0 ? ` | ${Math.round(t.hours)}ч` : ''})`).join('\n');

  catalog += `[#${i + 1}] SteamID: ${a.steamid} | Ник: "${a.nickname}" (Steam Lv ${a.steamLevel})
    💵 Оценка: $${v.estimatedWorthUsd || 0} USD  ➔  Рекомендуемая цена продажи: ${v.suggestedSalePriceRub || 89} ₽
    🏷️ Отметки: ${c.marksSummary || '[⭐ CS2 Prime Status]'}
    🎮 Коммерческие тайтлы (${c.commercialTitlesCount || 0} шт, MSRP: $${c.retailTotalUsd || 0}):
${titles || '   • Counter-Strike 2 (Prime Status Upgrade)'}
    📊 CS2 Инвентарь: $${a.cs2InventoryUsd || 0} | Медалей: ${a.cs2MedalsCount || 0}
    🔑 Токен авторизации:
    ${a.token}\n
--------------------------------------------------------------------------------\n`;
});

catalog += `\n================================================================================
  🔴 АРХИВ / НЕВАЛИД / ПОД ЗАМЕНУ (ВЫВЕДЕНЫ ИЗ ПРОДАЖИ)
================================================================================\n\n`;

deadAccounts.forEach((a, i) => {
  const note = a.steamid === '76561199222229128' ? '❌ СЕССИЯ СБРОШЕНА / NO WORK' : '🔒 БАН СООБЩЕСТВА 160 ДНЕЙ';
  catalog += `[АРХИВ #${i + 1}] SteamID: ${a.steamid} | Ник: "${a.nickname}"
    ⚠️ ПРИЧИНА: ${note}
    🔑 Токен:
    ${a.token}\n
--------------------------------------------------------------------------------\n`;
});

fs.writeFileSync('C:\\Users\\iliyk\\Desktop\\steam_commercial_catalog.txt', catalog, 'utf8');
console.log('steam_commercial_catalog.txt partitioned successfully!');
