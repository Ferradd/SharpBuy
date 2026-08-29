#!/usr/bin/env node
/**
 * 🦅 SHARPBUY — COMMERCIAL TITLES & USER LIBRARIES AUDITOR
 * Утилита для глубокой обработки профилей через авторизационные ключи / токены Steam
 * с целью выявления и проставления отметок о наличии коммерческих тайтлов в библиотеках.
 * 
 * Использование:
 *   node scripts/audit_commercial_titles.js [опции]
 * 
 * Опции:
 *   --input <path>       Путь к файлу с токенами / ключами (по умолчанию Desktop/steam.txt)
 *   --key <token>        Обработать одиночный ключ/токен
 *   --sync-db            Синхронизировать и проставить отметки в базе заказов orders_database.json
 *   --output-json <path> Путь для сохранения полного JSON отчета
 *   --output-csv <path>  Путь для сохранения CSV таблицы
 *   --output-txt <path>  Путь для сохранения текстового прайс-листа
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { WalletSecurityCollector } from '../src/tools/steamAuditor/Collectors/WalletSecurityCollector.js';
import { CS2FaceitCollector } from '../src/tools/steamAuditor/Collectors/CS2FaceitCollector.js';
import { GamesInventoryCollector } from '../src/tools/steamAuditor/Collectors/GamesInventoryCollector.js';
import { CommercialTitlesAuditor } from '../src/tools/steamAuditor/Collectors/CommercialTitlesAuditor.js';
import { CommercialTitlesCatalog, COMMERCIAL_GAMES_CATALOG } from '../src/tools/steamAuditor/Collectors/CommercialTitlesCatalog.js';
import { ValuationEngine } from '../src/tools/steamAuditor/ValuationEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// ANSI Color helper
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  gold: '\x1b[38;5;220m',
  amber: '\x1b[38;5;214m',
  green: '\x1b[38;5;48m',
  cyan: '\x1b[38;5;51m',
  red: '\x1b[38;5;196m',
  rose: '\x1b[38;5;204m',
  yellow: '\x1b[38;5;226m',
  blue: '\x1b[38;5;75m',
  purple: '\x1b[38;5;141m',
  gray: '\x1b[38;5;244m'
};

// Parse CLI Args
const args = process.argv.slice(2);
function getArgVal(flag, defaultVal = null) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return defaultVal;
}
const hasFlag = (flag) => args.includes(flag);

const singleKey = getArgVal('--key') || getArgVal('--token');
const inputFile = getArgVal('--input');
const syncDb = hasFlag('--sync-db') || true; // Default enabled for complete database synchronization
const outputJson = getArgVal('--output-json', path.join(rootDir, 'src/data/commercial_titles_audit_report.json'));
const outputCsv = getArgVal('--output-csv', 'C:\\Users\\iliyk\\Desktop\\commercial_titles_audit.csv');
const outputTxt = getArgVal('--output-txt', 'C:\\Users\\iliyk\\Desktop\\steam_commercial_catalog.txt');

console.log(`${colors.gold}${colors.bold}
================================================================================
  🦅 SHARPBUY — COMMERCIAL TITLES & LIBRARY AUDITOR ENGINE v2.0
  Выявление и проставление отметок о коммерческих тайтлах в профилях Steam
================================================================================${colors.reset}
`);

async function collectTokensToProcess() {
  const tokenSet = new Map(); // token -> metadata

  // 1. Single Key passed via CLI
  if (singleKey) {
    tokenSet.set(singleKey.trim(), { source: 'CLI_ARG' });
    return tokenSet;
  }

  // 2. Custom input file
  if (inputFile && fs.existsSync(inputFile)) {
    console.log(`${colors.cyan}📂 Чтение входного файла: ${inputFile}${colors.reset}`);
    const content = fs.readFileSync(inputFile, 'utf8');
    const matches = content.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];
    matches.forEach(t => tokenSet.set(t, { source: 'CUSTOM_FILE' }));
  } else {
    // 3. Default Desktop/steam.txt
    const defaultDesktopTxt = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
    if (fs.existsSync(defaultDesktopTxt)) {
      console.log(`${colors.cyan}📂 Чтение токенов с Desktop: steam.txt${colors.reset}`);
      const content = fs.readFileSync(defaultDesktopTxt, 'utf8');
      const matches = content.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];
      matches.forEach(t => tokenSet.set(t, { source: 'DESKTOP_STEAM_TXT' }));
    }

    // 4. Default orders_database.json
    const ordersPath = path.join(rootDir, 'src/data/orders_database.json');
    if (fs.existsSync(ordersPath)) {
      try {
        const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        orders.forEach(o => {
          (o.tokens || []).forEach(t => {
            if (!tokenSet.has(t)) {
              tokenSet.set(t, {
                orderId: o.orderId,
                productName: o.productName,
                amountRub: o.amountRub,
                source: 'ORDERS_DATABASE'
              });
            }
          });
        });
      } catch (e) {}
    }
  }

  return tokenSet;
}

async function runCommercialAuditor() {
  const tokenMap = await collectTokensToProcess();
  const tokenList = Array.from(tokenMap.entries());

  if (tokenList.length === 0) {
    console.log(`${colors.red}❌ Не найдено токенов для обработки.${colors.reset}`);
    console.log(`Укажите путь к файлу через --input <файл> или передайте токен через --key <токен>`);
    return;
  }

  console.log(`${colors.green}✓ Найдено ${tokenList.length} уникальных профилей/токенов для аудита коммерческих библиотек.${colors.reset}\n`);

  const auditedResults = [];
  let processed = 0;
  let totalCommercialTitlesDetected = 0;
  let totalCommercialRetailUsd = 0;
  let totalCommercialResaleUsd = 0;
  let accountsWithPaidGamesCount = 0;
  const gamesFrequencyMap = new Map(); // appid -> { name, count }

  for (const [rawToken, meta] of tokenList) {
    processed++;
    const parsed = SteamSessionEngine.parseToken(rawToken);
    if (!parsed) {
      console.log(`${colors.gray}[${processed}/${tokenList.length}] Пропуск некорректного токена...${colors.reset}`);
      continue;
    }

    process.stdout.write(`${colors.amber}[${processed}/${tokenList.length}] Аудит ${parsed.steamid}... ${colors.reset}`);

    try {
      // 1. Profile metadata
      const profile = await SteamSessionEngine.fetchLiveProfile(parsed.steamid);
      let acc = { ...parsed, profile, ...meta };

      // 2. Security & Wallet
      acc = await WalletSecurityCollector.auditStage2(acc);

      // 3. CS2 & Faceit & Medals
      acc = await CS2FaceitCollector.auditStage3(acc);

      // 4. Games Library & Secondary Inventories
      acc = await GamesInventoryCollector.auditStage4(acc);

      // 5. Commercial Titles Detection & Marking Engine
      acc = await CommercialTitlesAuditor.auditCommercialTitles(acc);

      // 6. Valuation & Smart Badges Generation
      acc = ValuationEngine.evaluateAccount(acc);

      auditedResults.push(acc);

      // Statistics
      const cSumm = acc.commercialSummary || {};
      if (cSumm.hasCommercialTitles) {
        if (cSumm.hasNonPrimeTitles) accountsWithPaidGamesCount++;
        totalCommercialTitlesDetected += cSumm.commercialTitlesCount;
        totalCommercialRetailUsd += cSumm.retailTotalUsd;
        totalCommercialResaleUsd += cSumm.resaleTotalUsd;

        for (const t of cSumm.titles) {
          const prev = gamesFrequencyMap.get(t.appid) || { name: t.name, count: 0 };
          prev.count++;
          gamesFrequencyMap.set(t.appid, prev);
        }
      }

      const markStr = cSumm.marksSummary;
      console.log(`${colors.green}✓ ${profile.nickname} (${profile.steamLevel} lvl) ${colors.gold}${markStr}${colors.reset}`);

    } catch (err) {
      console.log(`${colors.red}Ошибка: ${err.message}${colors.reset}`);
    }

    // Gentle delay to respect Steam rate limits
    if (processed < tokenList.length) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log(`\n${colors.gold}${colors.bold}================================================================================
                     📊 ИТОГИ АУДИТА КОММЕРЧЕСКИХ ТАЙТЛОВ
================================================================================${colors.reset}`);
  console.log(` • Всего обработано профилей:      ${colors.bold}${auditedResults.length}${colors.reset}`);
  console.log(` • Профилей с платными играми:      ${colors.green}${colors.bold}${accountsWithPaidGamesCount}${colors.reset}`);
  console.log(` • Всего выявлено коммерч. тайтлов: ${colors.amber}${colors.bold}${totalCommercialTitlesDetected}${colors.reset}`);
  console.log(` • Суммарный ритейл прайс (MSRP):   ${colors.green}${colors.bold}$${totalCommercialRetailUsd.toFixed(2)} USD (~${Math.round(totalCommercialRetailUsd * 90).toLocaleString()} ₽)${colors.reset}`);
  console.log(` • Добавочная ценность при продаже: ${colors.gold}${colors.bold}+$${totalCommercialResaleUsd.toFixed(2)} USD (~${Math.round(totalCommercialResaleUsd * 90).toLocaleString()} ₽)${colors.reset}`);

  // Top Games Breakdown Table
  if (gamesFrequencyMap.size > 0) {
    console.log(`\n${colors.cyan}${colors.bold}🎮 РАСПРЕДЕЛЕНИЕ КОММЕРЧЕСКИХ ИГР В БАЗЕ:${colors.reset}`);
    const sortedGames = Array.from(gamesFrequencyMap.entries()).sort((a, b) => b[1].count - a[1].count);
    for (const [appid, data] of sortedGames) {
      const meta = COMMERCIAL_GAMES_CATALOG[appid] || {};
      console.log(`   • ${colors.bold}${data.name}${colors.reset} [AppID: ${appid} | ${meta.genre || 'Game'}]: ${colors.amber}${data.count} аккаунтов${colors.reset} (MSRP: $${meta.basePriceUsd || 0})`);
    }
  }

  // 1. Export JSON Report
  const jsonReportData = {
    generatedAt: new Date().toISOString(),
    totalAudited: auditedResults.length,
    accountsWithPaidGamesCount,
    totalCommercialTitlesDetected,
    totalCommercialRetailUsd: Number(totalCommercialRetailUsd.toFixed(2)),
    totalCommercialResaleUsd: Number(totalCommercialResaleUsd.toFixed(2)),
    accounts: auditedResults.map(a => ({
      steamid: a.steamid,
      nickname: a.profile?.nickname || 'Unknown',
      avatar: a.profile?.avatar || '',
      steamLevel: a.profile?.steamLevel || 0,
      accountAgeYears: a.profile?.accountAgeYears || 0,
      vacBanned: a.security?.vacBanned || false,
      walletBalanceUsd: a.wallet?.balance || 0,
      cs2InventoryUsd: a.cs2?.inventoryWorthUsd || 0,
      cs2MedalsCount: a.cs2?.medalsCount || 0,
      faceitLevel: a.faceit?.registered ? a.faceit.level : null,
      totalGamesCount: a.games?.totalGamesCount || 0,
      commercialSummary: a.commercialSummary,
      valuation: a.valuation,
      token: `${a.steamid}----${a.jwt}`
    }))
  };

  fs.writeFileSync(outputJson, JSON.stringify(jsonReportData, null, 2), 'utf8');
  console.log(`\n${colors.green}✓ JSON отчет с отметками сохранен в: ${outputJson}${colors.reset}`);

  // 2. Export CSV Table
  const csvHeaders = [
    'SteamID',
    'Nickname',
    'Steam_Level',
    'Country',
    'Account_Age_Yrs',
    'Has_Paid_Games',
    'Commercial_Titles_Count',
    'Commercial_Titles_List',
    'Commercial_Marks',
    'Commercial_MSRP_USD',
    'Commercial_Added_USD',
    'Wallet_USD',
    'CS2_Inv_USD',
    'CS2_Medals',
    'Total_Estimated_USD',
    'Suggested_Price_RUB',
    'VAC_Banned',
    'Token'
  ];

  const csvRows = auditedResults.map(a => {
    const c = a.commercialSummary || {};
    const titlesListStr = (c.titles || []).map(t => `${t.name}${t.hours > 0 ? ` (${Math.round(t.hours)}h)` : ''}`).join('; ');
    const marksListStr = (c.marks || []).map(m => m.id).join('; ');

    return [
      a.steamid,
      `"${(a.profile?.nickname || '').replace(/"/g, '""')}"`,
      a.profile?.steamLevel || 0,
      a.security?.country || 'Unknown',
      a.profile?.accountAgeYears || 0,
      c.hasNonPrimeTitles ? 'YES' : 'NO',
      c.commercialTitlesCount || 0,
      `"${titlesListStr.replace(/"/g, '""')}"`,
      `"${marksListStr}"`,
      c.retailTotalUsd || 0,
      c.resaleTotalUsd || 0,
      a.wallet?.balance || 0,
      a.cs2?.inventoryWorthUsd || 0,
      a.cs2?.medalsCount || 0,
      a.valuation?.estimatedWorthUsd || 0,
      a.valuation?.suggestedSalePriceRub || 89,
      a.security?.vacBanned ? 'YES' : 'NO',
      `"${a.steamid}----${a.jwt}"`
    ];
  });

  const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n');
  try {
    fs.writeFileSync(outputCsv, csvContent, 'utf8');
    console.log(`${colors.green}✓ CSV таблица с коммерческими отметками сохранена: ${outputCsv}${colors.reset}`);
  } catch (e) {
    console.log(`${colors.yellow}⚠️ Не удалось сохранить CSV на Desktop: ${e.message}${colors.reset}`);
  }

  // 3. Export Formatted Price List TXT
  let txtCatalog = `================================================================================
           🦅 SHARPBUY — КАТАЛОГ С КОММЕРЧЕСКИМИ ТАЙТЛАМИ И ОТМЕТКАМИ
================================================================================
Всего аккаунтов: ${auditedResults.length}
С платными коммерческими играми: ${accountsWithPaidGamesCount}
Дата генерации: ${new Date().toLocaleString('ru-RU')}
================================================================================\n\n`;

  auditedResults.forEach((a, i) => {
    const c = a.commercialSummary || {};
    const v = a.valuation || {};
    const marksStr = c.marksSummary || 'NFA Prime';
    const titlesDetail = (c.titles || []).map(t => `   • ${t.name} (MSRP: $${t.basePriceUsd} | Оценка: +$${t.resaleValueUsd}${t.hours > 0 ? ` | ${Math.round(t.hours)}ч` : ''})`).join('\n');

    txtCatalog += `[#${i + 1}] SteamID: ${a.steamid} | Ник: "${a.profile?.nickname || 'Unknown'}" (Steam Lv ${a.profile?.steamLevel || 0})
    💵 Оценка: $${v.estimatedWorthUsd || 0} USD  ➔  Рекомендуемая розничная цена: ${v.suggestedSalePriceRub || 89} ₽
    🏷️ Отметки: ${marksStr}
    🎮 Коммерческие тайтлы (${c.commercialTitlesCount || 0} шт, MSRP: $${c.retailTotalUsd || 0}):
${titlesDetail || '   • Стандартный CS2 Prime'}
    📊 Баланс: $${a.wallet?.balance || 0} | CS2 Инвентарь: $${a.cs2?.inventoryWorthUsd || 0} (${a.cs2?.totalItems || 0} предм, ${a.cs2?.medalsCount || 0} медалей)
    🔑 Токен авторизации:
    ${a.steamid}----${a.jwt}\n
--------------------------------------------------------------------------------\n`;
  });

  try {
    fs.writeFileSync(outputTxt, txtCatalog, 'utf8');
    console.log(`${colors.green}✓ Текстовый коммерческий каталог сохранен: ${outputTxt}${colors.reset}`);
  } catch (e) {
    console.log(`${colors.yellow}⚠️ Не удалось сохранить TXT на Desktop: ${e.message}${colors.reset}`);
  }

  // 4. Sync with Database (orders_database.json & api/orders_database.json)
  if (syncDb) {
    try {
      const ordersFilePath = path.join(rootDir, 'src/data/orders_database.json');
      const apiOrdersPath = path.join(rootDir, 'api/orders_database.json');

      let existingDb = [];
      if (fs.existsSync(ordersFilePath)) {
        existingDb = JSON.parse(fs.readFileSync(ordersFilePath, 'utf8'));
      }

      // Map audited data by steamid
      const auditedMap = new Map();
      auditedResults.forEach(a => auditedMap.set(a.steamid, a));

      // Update existing orders with commercial marks
      let updatedOrdersCount = 0;
      for (const order of existingDb) {
        const orderSteamId = order.steamId || (order.tokens && order.tokens[0] ? order.tokens[0].split('----')[0] : null);
        if (orderSteamId && auditedMap.has(orderSteamId)) {
          const audited = auditedMap.get(orderSteamId);
          const c = audited.commercialSummary || {};
          order.commercialTitles = c.titles || [];
          order.commercialMarks = c.marks || [];
          order.commercialTags = c.tags || [];
          order.commercialRetailUsd = c.retailTotalUsd || 0;
          order.commercialResaleUsd = c.resaleTotalUsd || 0;
          order.commercialMarksSummary = c.marksSummary || '';
          order.estimatedWorthUsd = audited.valuation?.estimatedWorthUsd || 0;
          order.suggestedSalePriceRub = audited.valuation?.suggestedSalePriceRub || order.amountRub;
          updatedOrdersCount++;
        }
      }

      fs.writeFileSync(ordersFilePath, JSON.stringify(existingDb, null, 2), 'utf8');
      if (fs.existsSync(path.dirname(apiOrdersPath))) {
        fs.writeFileSync(apiOrdersPath, JSON.stringify(existingDb, null, 2), 'utf8');
      }

      console.log(`${colors.gold}${colors.bold}✓ База данных заказов успешно обновлена и синхронизирована с коммерческими отметками! (${updatedOrdersCount} заказов)${colors.reset}`);
    } catch (e) {
      console.log(`${colors.red}❌ Ошибка при синхронизации базы: ${e.message}${colors.reset}`);
    }
  }

  console.log(`\n${colors.green}${colors.bold}🎯 АУДИТ И ПРОСТАВЛЕНИЕ ОТМЕТОК УСПЕШНО ЗАВЕРШЕНЫ!${colors.reset}\n`);
}

runCommercialAuditor();
