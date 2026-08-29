/**
 * SharpBuy Steam Auditor - Valuation Engine & Smart Badges
 */

export class ValuationEngine {
  static evaluateAccount(account) {
    const walletBalance = account.wallet?.balance || 0;
    const pointsWorthUsd = account.wallet?.pointsWorthUsd || 0;
    const cs2WorthUsd = account.cs2?.inventoryWorthUsd || 0;
    const gamesAddedUsd = account.games?.libraryAccountValueUsd || 0;
    const dota2WorthUsd = account.secondaryInventories?.dota2?.worthUsd || 0;
    const tf2WorthUsd = account.secondaryInventories?.tf2?.worthUsd || 0;
    const rustWorthUsd = account.secondaryInventories?.rust?.worthUsd || 0;

    const steamLevel = account.profile?.steamLevel || 0;
    const age = account.profile?.accountAgeYears || account.security?.accountAgeYears || 0;

    // Base Prime / Premier NFA account baseline value
    let baseValueUsd = 1.0; 

    // Tier Bonus from Level, Age, Medals, Faceit
    let tierBonusUsd = 0;

    // Steam Level Bonus
    if (steamLevel >= 50) tierBonusUsd += 15.0;
    else if (steamLevel >= 25) tierBonusUsd += 6.5;
    else if (steamLevel >= 15) tierBonusUsd += 3.0;
    else if (steamLevel >= 10) tierBonusUsd += 1.5;
    else if (steamLevel >= 5) tierBonusUsd += 0.5;

    // Medals bonus
    if (account.cs2?.hasRareOldMedals) {
      tierBonusUsd += 4.5;
    } else if (account.cs2?.medalsCount > 0) {
      tierBonusUsd += account.cs2.medalsCount * 1.2;
    }

    // Account Age bonus
    if (age >= 15) tierBonusUsd += 5.0;
    else if (age >= 10) tierBonusUsd += 3.0;
    else if (age >= 5) tierBonusUsd += 1.5;

    // Faceit High Level bonus
    if (account.faceit?.registered) {
      const lvl = account.faceit.level || 0;
      if (lvl === 10) tierBonusUsd += 25.0;
      else if (lvl >= 8) tierBonusUsd += 12.0;
      else if (lvl >= 5) tierBonusUsd += 4.0;
    }

    // Total estimated raw worth in USD
    const estimatedWorthUsd = Number((
      baseValueUsd +
      walletBalance +
      (cs2WorthUsd * 0.85) +
      (dota2WorthUsd * 0.80) +
      (tf2WorthUsd * 0.85) +
      (rustWorthUsd * 0.80) +
      pointsWorthUsd +
      gamesAddedUsd +
      tierBonusUsd
    ).toFixed(2));

    // Suggested retail price in RUB (Psychological pricing)
    let suggestedRub = Math.round(estimatedWorthUsd * 90);
    if (suggestedRub < 89) suggestedRub = 89;

    // Generate Smart Badges
    const badges = [];

    if (steamLevel >= 20) {
      badges.push({ id: 'LEVEL-HIGH', label: `⭐ Steam Lv ${steamLevel}`, color: 'purple' });
    } else if (steamLevel >= 10) {
      badges.push({ id: 'LEVEL', label: `⭐ Lv ${steamLevel}`, color: 'blue' });
    }

    if (walletBalance >= 5.0) {
      badges.push({ id: 'HIGH-BALANCE', label: `💰 Баланс $${walletBalance.toFixed(2)}`, color: 'emerald' });
    } else if (walletBalance > 0) {
      badges.push({ id: 'BALANCE', label: `💵 $${walletBalance.toFixed(2)}`, color: 'green' });
    }

    if (cs2WorthUsd >= 15.0) {
      badges.push({ id: 'RICH-INVENTORY', label: `🔥 Инвентарь CS2 $${cs2WorthUsd.toFixed(2)}`, color: 'amber' });
    } else if (cs2WorthUsd > 0) {
      badges.push({ id: 'INVENTORY', label: `🎒 Скины $${cs2WorthUsd.toFixed(2)}`, color: 'yellow' });
    }

    if (account.cs2?.knivesCount > 0) {
      badges.push({ id: 'KNIFE', label: `★ Нож (${account.cs2.knivesCount} шт)`, color: 'purple' });
    }

    if (account.cs2?.hasExpensiveCases) {
      badges.push({ id: 'RARE-CASES', label: `📦 Дорогие кейсы`, color: 'orange' });
    }

    if (account.cs2?.hasRareOldMedals) {
      badges.push({ id: 'OLD-MEDALS', label: `🎖️ Редкие медали`, color: 'cyan' });
    } else if (account.cs2?.medalsCount > 0) {
      badges.push({ id: 'MEDALS', label: `🎖️ Медали (${account.cs2.medalsCount})`, color: 'blue' });
    }

    if (account.faceit?.registered && account.faceit.level >= 8) {
      badges.push({ id: 'FACEIT-HIGH', label: `🏆 Faceit Lvl ${account.faceit.level} (${account.faceit.elo} ELO)`, color: 'red' });
    } else if (account.faceit?.registered && account.faceit.level >= 4) {
      badges.push({ id: 'FACEIT', label: `⚡ Faceit Lvl ${account.faceit.level}`, color: 'orange' });
    }

    if (account.wallet?.points >= 20000) {
      badges.push({ id: 'HIGH-POINTS', label: `💎 ${(account.wallet.points / 1000).toFixed(0)}k Points`, color: 'indigo' });
    }

    if (account.games?.hasRust) badges.push({ id: 'RUST', label: `🎮 Rust`, color: 'rose' });
    if (account.games?.hasGta5) badges.push({ id: 'GTA5', label: `🎮 GTA V`, color: 'teal' });
    if (account.games?.hasCyberpunk) badges.push({ id: 'CYBERPUNK', label: `🎮 Cyberpunk 2077`, color: 'yellow' });
    if (account.games?.hasRdr2) badges.push({ id: 'RDR2', label: `🤠 RDR 2`, color: 'red' });

    // Append commercial titles marks
    if (account.commercialSummary?.marks && Array.isArray(account.commercialSummary.marks)) {
      for (const cm of account.commercialSummary.marks) {
        if (!badges.some(b => b.id === cm.id)) {
          badges.push(cm);
        }
      }
    }

    if (age >= 10) {
      badges.push({ id: 'OLD-SCHOOL', label: `👑 ${age} лет выслуги`, color: 'amber' });
    }

    if (account.security?.isLimited) {
      badges.push({ id: 'LIMITED', label: `⚠️ Limited ($5 limit)`, color: 'neutral' });
    }

    if (account.security?.vacBanned) {
      badges.push({ id: 'VAC-BANNED', label: `❌ VAC BAN`, color: 'rose' });
    }

    return {
      ...account,
      valuation: {
        estimatedWorthUsd,
        suggestedSalePriceRub: suggestedRub,
        breakdown: {
          walletUsd: walletBalance,
          cs2Usd: cs2WorthUsd,
          secondaryInventoriesUsd: Number((dota2WorthUsd + tf2WorthUsd + rustWorthUsd).toFixed(2)),
          pointsWorthUsd,
          gamesResaleUsd: gamesAddedUsd,
          tierBonusUsd
        },
        badges
      }
    };
  }

  static exportToCSV(auditedAccounts) {
    const headers = [
      'SteamID',
      'Nickname',
      'Steam_Level',
      'Country',
      'Account Age (Yrs)',
      'Estimated Worth ($)',
      'Suggested Price (RUB)',
      'Wallet Balance ($)',
      'Steam Points',
      'CS2 Items Count',
      'CS2 Inventory ($)',
      'Medals Count',
      'Faceit Level',
      'Total Games',
      'VAC Banned',
      'Badges'
    ];

    const rows = auditedAccounts.map(acc => [
      acc.steamid,
      `"${(acc.profile?.nickname || '').replace(/"/g, '""')}"`,
      acc.profile?.steamLevel || 0,
      acc.security?.country || 'Unknown',
      acc.profile?.accountAgeYears || acc.security?.accountAgeYears || 0,
      acc.valuation?.estimatedWorthUsd || 0,
      acc.valuation?.suggestedSalePriceRub || 89,
      acc.wallet?.balance || 0,
      acc.wallet?.points || 0,
      acc.cs2?.totalItems || 0,
      acc.cs2?.inventoryWorthUsd || 0,
      acc.cs2?.medalsCount || 0,
      acc.faceit?.registered ? acc.faceit.level : 'None',
      acc.games?.totalGamesCount || 0,
      acc.security?.vacBanned ? 'YES' : 'NO',
      `"${(acc.valuation?.badges || []).map(b => b.id).join('; ')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static exportToPriceListTxt(auditedAccounts) {
    let output = `================================================================================\n`;
    output += `  🦅 SHARPBUY STEAM AUDITOR — ПРАЙС-ЛИСТ И АУДИТ ТОКЕНОВ\n`;
    output += `  Всего аккаунтов: ${auditedAccounts.length} | Сгенерировано: ${new Date().toISOString()}\n`;
    output += `================================================================================\n\n`;

    auditedAccounts.forEach((acc, idx) => {
      const v = acc.valuation || {};
      const badgeStr = (v.badges || []).map(b => `[${b.label}]`).join(' ');

      output += `[#${idx + 1}] SteamID: ${acc.steamid} | Ник: "${acc.profile?.nickname || 'Unknown'}" (Steam Lv ${acc.profile?.steamLevel || 0})\n`;
      output += `     💵 Оценка: $${v.estimatedWorthUsd || 0} USD  ➔  Рекомендуемая цена: ${v.suggestedSalePriceRub || 89} ₽\n`;
      output += `     🏷️ Теги: ${badgeStr || 'CS2 Prime NFA'}\n`;
      output += `     📊 Данные: Баланс: $${acc.wallet?.balance || 0} | CS2 Инв: $${acc.cs2?.inventoryWorthUsd || 0} (${acc.cs2?.totalItems || 0} шт, ${acc.cs2?.medalsCount || 0} медалей) | Игр: ${acc.games?.totalGamesCount || 0}\n`;
      output += `     🔑 Токен: ${acc.steamid}----${acc.jwt}\n\n`;
    });

    return output;
  }
}
