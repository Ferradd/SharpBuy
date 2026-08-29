/**
 * SharpBuy Steam Auditor - Games Library & Multi-Game Inventories Collector
 * Parses owned games, game hours (CS2, Dota2, Rust, GTA V, etc.), detects paid AAA titles
 * and scrapes secondary inventories (Dota 2, Team Fortress 2, Rust).
 */

import { COMMERCIAL_GAMES_CATALOG, CommercialTitlesCatalog } from './CommercialTitlesCatalog.js';

export class GamesInventoryCollector {
  /**
   * Catalog of popular paid games and their estimated retail / account added value (in USD)
   */
  static TOP_PAID_GAMES = COMMERCIAL_GAMES_CATALOG;


  /**
   * Parses owned games, total count and playtime from Steam Profile HTML and XML
   * @param {string} steamid 
   * @returns {Promise<Object>}
   */
  static async collectGamesLibrary(steamid) {
    const gamesData = {
      steamid,
      totalGamesCount: 0,
      totalPlaytimeHours: 0,
      libraryRetailValueUsd: 0,
      libraryAccountValueUsd: 0,
      paidGames: [],
      hoursByGame: {
        cs2: 0,
        dota2: 0,
        rust: 0,
        gta5: 0,
        cyberpunk: 0,
        squad: 0,
        rdr2: 0,
        mafia: 0
      },
      hasRust: false,
      hasGta5: false,
      hasCyberpunk: false,
      hasRdr2: false,
      hasSquad: false,
      hasMafia: false,
      allGames: []
    };

    const gamesMap = new Map(); // appid or name -> game obj
    let totalRetail = 0;
    let totalAdded = 0;
    let totalHours = 0;

    // 1. PRIMARY: Parse Steam Profile HTML
    try {
      const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (res.status === 200) {
        const html = await res.text();

        // Extract total games count from profile link
        const totalGamesMatch = html.match(/href="[^"]*\/games\/[^"]*">\s*Games\s*<span[^>]*class="profile_count_link_total"[^>]*>\s*(\d+)\s*<\/span>/i) ||
                                html.match(/profile_count_link_total">\s*(\d+)\s*<\/span>/i) ||
                                html.match(/Games\s*<span class="count">(\d+)<\/span>/i);
        if (totalGamesMatch) {
          gamesData.totalGamesCount = parseInt(totalGamesMatch[1], 10) || 0;
        }

        // Extract recent game blocks
        const recentGameBlocks = html.split('<div class="recent_game">').slice(1);
        for (const block of recentGameBlocks) {
          const nameMatch = block.match(/class="game_name">\s*<a[^>]*>([^<]+)<\/a>/i);
          const appidMatch = block.match(/href="https:\/\/steamcommunity\.com\/app\/(\d+)"/i) || block.match(/app\/(\d+)/i);
          const hoursMatch = block.match(/([0-9.,]+)\s*hrs on record/i);

          if (nameMatch) {
            const name = nameMatch[1].trim();
            const appid = appidMatch ? appidMatch[1] : null;
            const rawHours = hoursMatch ? parseFloat(hoursMatch[1].replace(/,/g, '')) : 0;
            const hours = isNaN(rawHours) ? 0 : rawHours;

            const key = appid || name.toLowerCase();
            if (!gamesMap.has(key)) {
              gamesMap.set(key, { appid: appid || '0', name, hours });
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[GamesInventoryCollector] Profile HTML error for ${steamid}: ${err.message}`);
    }

    // 2. SECONDARY: Parse Steam Games XML (if available)
    try {
      const xmlRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/games/?tab=all&xml=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (xmlRes.status === 200) {
        const xml = await xmlRes.text();
        if (xml.includes('<gamesList>') || xml.includes('<appID>')) {
          const gameRegex = /<appID>(\d+)<\/appID>\s*<name><!\[CDATA\[(.*?)\]\]><\/name>(?:\s*<hoursOnRecord>([0-9.,]+)<\/hoursOnRecord>)?/g;
          let match;
          while ((match = gameRegex.exec(xml)) !== null) {
            const appid = match[1];
            const name = match[2];
            const rawHours = match[3] ? parseFloat(match[3].replace(/,/g, '')) : 0;
            const hours = isNaN(rawHours) ? 0 : rawHours;

            const key = appid;
            if (!gamesMap.has(key)) {
              gamesMap.set(key, { appid, name, hours });
            }
          }
        }
      }
    } catch (err) {}

    // Process all discovered games through CommercialTitlesCatalog
    for (const game of gamesMap.values()) {
      const appid = game.appid;
      const name = game.name;
      const hours = game.hours;

      totalHours += hours;

      const commMatch = CommercialTitlesCatalog.matchGame(appid, name);
      const isPaid = Boolean(commMatch && commMatch.basePriceUsd > 0);

      if (isPaid) {
        totalRetail += commMatch.basePriceUsd;
        totalAdded += commMatch.resaleValueUsd;
        gamesData.paidGames.push({
          appid: commMatch.appid || appid,
          name: commMatch.name || name,
          genre: commMatch.genre,
          tier: commMatch.tier,
          hours,
          basePriceUsd: commMatch.basePriceUsd,
          basePriceRub: commMatch.basePriceRub,
          addedValueUsd: commMatch.resaleValueUsd
        });
      }

      // Track hours and flags
      const lowerName = name.toLowerCase();
      if (appid === '730' || lowerName.includes('counter-strike')) gamesData.hoursByGame.cs2 = hours;
      if (appid === '570' || lowerName.includes('dota 2')) gamesData.hoursByGame.dota2 = hours;
      if (appid === '252490' || lowerName.includes('rust')) {
        gamesData.hoursByGame.rust = hours;
        gamesData.hasRust = true;
      }
      if (appid === '271590' || lowerName.includes('grand theft auto') || lowerName.includes('gta')) {
        gamesData.hoursByGame.gta5 = hours;
        gamesData.hasGta5 = true;
      }
      if (appid === '1091500' || lowerName.includes('cyberpunk')) {
        gamesData.hoursByGame.cyberpunk = hours;
        gamesData.hasCyberpunk = true;
      }
      if (appid === '393380' || lowerName.includes('squad')) {
        gamesData.hoursByGame.squad = hours;
        gamesData.hasSquad = true;
      }
      if (appid === '1174180' || lowerName.includes('red dead') || lowerName.includes('rdr')) {
        gamesData.hoursByGame.rdr2 = hours;
        gamesData.hasRdr2 = true;
      }
      if (appid === '1030840' || lowerName.includes('mafia')) {
        gamesData.hoursByGame.mafia = hours;
        gamesData.hasMafia = true;
      }

      gamesData.allGames.push({ appid, name, hours, isPaid, commMatch });
    }

    if (gamesData.totalGamesCount === 0 && gamesData.allGames.length > 0) {
      gamesData.totalGamesCount = gamesData.allGames.length;
    }

    gamesData.totalPlaytimeHours = Number(totalHours.toFixed(1));
    gamesData.libraryRetailValueUsd = Number(totalRetail.toFixed(2));
    gamesData.libraryAccountValueUsd = Number(totalAdded.toFixed(2));

    return gamesData;
  }

  /**
   * Scrapes secondary inventory (Dota 2: 570/2, TF2: 440/2, Rust: 252490/2)
   * @param {string} steamid 
   * @param {number} appid 
   * @param {string} contextid 
   * @returns {Promise<Object>}
   */
  static async collectAppInventory(steamid, appid, contextid = '2') {
    const inv = {
      appid,
      isPublic: false,
      totalItems: 0,
      worthUsd: 0,
      worthRub: 0,
      highlightItems: []
    };

    try {
      const res = await fetch(`https://steamcommunity.com/inventory/${steamid}/${appid}/${contextid}?l=english&count=2000`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (res.status === 200) {
        const data = await res.json();
        if (data && Array.isArray(data.descriptions)) {
          inv.isPublic = true;
          inv.totalItems = data.descriptions.length;

          let totalEst = 0;
          for (const item of data.descriptions) {
            const name = item.market_name || item.name || '';
            const type = item.type || '';
            let price = 0;

            // Dota 2 Highlights
            if (appid === 570) {
              if (type.includes('Arcana') || name.includes('Arcana') || name.includes('Manifold Paradox') || name.includes('Fiery Soul')) {
                price = 24.0;
                inv.highlightItems.push({ name, type: 'Arcana', priceUsd: price });
              } else if (type.includes('Immortal') || name.includes('Immortal')) {
                price = 2.5;
                inv.highlightItems.push({ name, type: 'Immortal', priceUsd: price });
              } else {
                price = 0.08;
              }
            }
            // TF2 Highlights
            else if (appid === 440) {
              if (name.includes('Mann Co. Supply Crate Key')) {
                price = 2.15;
                inv.highlightItems.push({ name, type: 'Key', priceUsd: price });
              } else if (type.includes('Unusual') || name.includes('Unusual')) {
                price = 35.0;
                inv.highlightItems.push({ name, type: 'Unusual', priceUsd: price });
              } else if (name.includes('Australium')) {
                price = 45.0;
                inv.highlightItems.push({ name, type: 'Australium', priceUsd: price });
              } else {
                price = 0.05;
              }
            }
            // Rust Highlights
            else if (appid === 252490) {
              price = 0.75;
            }

            totalEst += price;
          }

          inv.worthUsd = Number(totalEst.toFixed(2));
          inv.worthRub = Math.round(totalEst * 90);
        }
      }
    } catch (err) {
      // Non-blocking
    }

    return inv;
  }

  /**
   * Full stage 4 collector execution
   * @param {Object} account 
   * @returns {Promise<Object>}
   */
  static async auditStage4(account) {
    const games = await this.collectGamesLibrary(account.steamid);
    const dota2Inv = await this.collectAppInventory(account.steamid, 570);
    const tf2Inv = await this.collectAppInventory(account.steamid, 440);
    const rustInv = await this.collectAppInventory(account.steamid, 252490);

    return {
      ...account,
      games,
      secondaryInventories: {
        dota2: dota2Inv,
        tf2: tf2Inv,
        rust: rustInv
      }
    };
  }
}
