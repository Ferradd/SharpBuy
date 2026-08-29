/**
 * SharpBuy Steam Auditor - Commercial Titles Auditor & Smart Tagging Engine
 * Detects commercial/paid AAA and multiplayer titles in user libraries, generates valuation metrics and assigns structured marks/badges.
 */

import { CommercialTitlesCatalog, COMMERCIAL_GAMES_CATALOG } from './CommercialTitlesCatalog.js';

export class CommercialTitlesAuditor {
  /**
   * Evaluates and tags all commercial titles for a given account
   * @param {Object} account - Account object with steamid, profile, games, secondaryInventories
   * @returns {Promise<Object>} Updated account with commercialMarks, commercialTitles, commercialValuation
   */
  static async auditCommercialTitles(account) {
    const steamid = account.steamid;
    const detectedCommercialTitles = new Map();
    const rawGamesList = account.games?.allGames || [];
    let totalCommercialHours = 0;
    let hasAAA = false;

    // 1. Direct detection from games list
    for (const g of rawGamesList) {
      const match = CommercialTitlesCatalog.matchGame(g.appid, g.name);
      if (match) {
        const hours = g.hours || 0;
        totalCommercialHours += hours;
        if (match.tier === 'AAA_PREMIUM') hasAAA = true;

        detectedCommercialTitles.set(match.appid, {
          appid: match.appid,
          name: match.name,
          genre: match.genre,
          tier: match.tier,
          hours,
          basePriceUsd: match.basePriceUsd,
          basePriceRub: match.basePriceRub,
          resaleValueUsd: match.resaleValueUsd,
          badgeTag: match.badgeTag,
          badgeLabel: match.badgeLabel,
          badgeColor: match.badgeColor,
          source: 'library_xml'
        });
      }
    }

    // 2. Detection from secondary inventories (e.g. Rust items present in inventory)
    const rustInv = account.secondaryInventories?.rust;
    if (rustInv && rustInv.totalItems > 0 && !detectedCommercialTitles.has('252490')) {
      const rustMeta = COMMERCIAL_GAMES_CATALOG['252490'];
      detectedCommercialTitles.set('252490', {
        appid: '252490',
        name: rustMeta.name,
        genre: rustMeta.genre,
        tier: rustMeta.tier,
        hours: account.games?.hoursByGame?.rust || 0,
        basePriceUsd: rustMeta.basePriceUsd,
        basePriceRub: rustMeta.basePriceRub,
        resaleValueUsd: rustMeta.resaleValueUsd,
        badgeTag: rustMeta.badgeTag,
        badgeLabel: rustMeta.badgeLabel,
        badgeColor: rustMeta.badgeColor,
        source: 'inventory_active'
      });
    }

    // 3. Fallback: Check for CS2 Prime (Default in SharpBuy NFA Premier/Prime catalog)
    if (!detectedCommercialTitles.has('730') && (account.cs2?.premierElo > 0 || account.cs2?.totalItems > 0 || account.cs2?.medalsCount > 0 || account.productName?.includes('Premier') || account.productName?.includes('Prime') || account.jwt || (account.tokens && account.tokens.length > 0))) {
      const primeMeta = COMMERCIAL_GAMES_CATALOG['730'];
      detectedCommercialTitles.set('730', {
        appid: '730',
        name: primeMeta.name,
        genre: primeMeta.genre,
        tier: primeMeta.tier,
        hours: account.games?.hoursByGame?.cs2 || 0,
        basePriceUsd: primeMeta.basePriceUsd,
        basePriceRub: primeMeta.basePriceRub,
        resaleValueUsd: primeMeta.resaleValueUsd,
        badgeTag: primeMeta.badgeTag,
        badgeLabel: primeMeta.badgeLabel,
        badgeColor: primeMeta.badgeColor,
        source: 'cs2_prime_status'
      });
    }

    // Convert map to array
    const commercialTitlesList = Array.from(detectedCommercialTitles.values());

    // Calculate aggregated metrics
    const retailTotalUsd = Number(commercialTitlesList.reduce((sum, g) => sum + g.basePriceUsd, 0).toFixed(2));
    const retailTotalRub = Math.round(commercialTitlesList.reduce((sum, g) => sum + g.basePriceRub, 0));
    const resaleTotalUsd = Number(commercialTitlesList.reduce((sum, g) => sum + g.resaleValueUsd, 0).toFixed(2));
    const resaleTotalRub = Math.round(resaleTotalUsd * 90);

    // Generate Commercial Marks and Badges
    const commercialMarks = [];
    const commercialTags = [];

    // Individual game badges
    for (const g of commercialTitlesList) {
      const label = g.hours > 0 ? `${g.badgeLabel} (${Math.round(g.hours)}ч)` : g.badgeLabel;
      commercialMarks.push({
        id: g.badgeTag,
        label,
        color: g.badgeColor,
        tier: g.tier,
        appid: g.appid
      });
      commercialTags.push(g.badgeTag);
    }

    // Volume and tier smart marks
    const nonPrimeCount = commercialTitlesList.filter(g => g.appid !== '730').length;

    if (hasAAA || retailTotalUsd >= 100) {
      commercialMarks.unshift({
        id: 'COMMERCIAL_AAA_WHALE',
        label: '🔥 AAA-WHALE ($100+ Игры)',
        color: 'amber',
        tier: 'VIP'
      });
      commercialTags.unshift('COMMERCIAL_AAA_WHALE');
    } else if (nonPrimeCount >= 5) {
      commercialMarks.unshift({
        id: 'COMMERCIAL_MULTI_5PLUS',
        label: `💎 ${nonPrimeCount}+ Платные игры`,
        color: 'purple',
        tier: 'HIGH'
      });
      commercialTags.unshift('COMMERCIAL_MULTI_5PLUS');
    } else if (nonPrimeCount >= 2) {
      commercialMarks.unshift({
        id: 'COMMERCIAL_MULTI_PAID',
        label: `⭐ ${nonPrimeCount} Платные игры`,
        color: 'blue',
        tier: 'MEDIUM'
      });
      commercialTags.unshift('COMMERCIAL_MULTI_PAID');
    } else if (nonPrimeCount === 1) {
      commercialMarks.unshift({
        id: 'COMMERCIAL_PAID_TITLE',
        label: '🎮 Платная игра',
        color: 'emerald',
        tier: 'STANDARD'
      });
      commercialTags.unshift('COMMERCIAL_PAID_TITLE');
    }

    if (totalCommercialHours >= 500) {
      commercialMarks.push({
        id: 'COMMERCIAL_HIGH_HOURS',
        label: `⏳ ${Math.round(totalCommercialHours)}ч геймплея`,
        color: 'cyan',
        tier: 'INFO'
      });
      commercialTags.push('COMMERCIAL_HIGH_HOURS');
    }

    // Summary line formatted for quick display
    const marksSummary = commercialMarks.map(m => `[${m.label}]`).join(' ');

    const commercialSummary = {
      hasCommercialTitles: commercialTitlesList.length > 0,
      hasNonPrimeTitles: nonPrimeCount > 0,
      commercialTitlesCount: commercialTitlesList.length,
      nonPrimeCommercialCount: nonPrimeCount,
      totalCommercialHours: Number(totalCommercialHours.toFixed(1)),
      hasAAA,
      retailTotalUsd,
      retailTotalRub,
      resaleTotalUsd,
      resaleTotalRub,
      titles: commercialTitlesList,
      marks: commercialMarks,
      tags: commercialTags,
      marksSummary: marksSummary || 'Без коммерческих тайтлов'
    };

    return {
      ...account,
      commercialSummary
    };
  }

  /**
   * Batch audit an array of accounts
   */
  static async auditBatch(accounts) {
    const results = [];
    for (const acc of accounts) {
      const audited = await this.auditCommercialTitles(acc);
      results.push(audited);
    }
    return results;
  }
}
