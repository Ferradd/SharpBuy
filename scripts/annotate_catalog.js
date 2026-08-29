import fs from 'fs';

const catalogPath = 'C:\\Users\\iliyk\\Desktop\\steam_commercial_catalog.txt';
let content = fs.readFileSync(catalogPath, 'utf8');

// Add NO WORK tag to 76561199222229128
content = content.replace(
  /(\[#\d+\] SteamID: 76561199222229128[^\n]*\n)/,
  '$1    ⚠️ СТАТУС: [❌ NO WORK / НЕ РАБОТАЕТ (СЕССИЯ СБРОШЕНА)]\n'
);

// Add BAN tag to 76561199250626158
content = content.replace(
  /(\[#\d+\] SteamID: 76561199250626158[^\n]*\n)/,
  '$1    🔒 СТАТУС: [⛔ BAN 160 DAYS / БАН СООБЩЕСТВА]\n'
);

fs.writeFileSync(catalogPath, content, 'utf8');
console.log('steam_commercial_catalog.txt annotated successfully with user tags!');
