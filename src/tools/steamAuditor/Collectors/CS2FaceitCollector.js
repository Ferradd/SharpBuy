/**
 * SharpBuy Steam Auditor - CS2 & Faceit Engine Collector
 * Parses CS2 items, detects service & veteran medals, operations, stickers, cases, knives
 * Evaluates inventory market worth and probes Faceit Level & ELO.
 */

export class CS2FaceitCollector {
  /**
   * Sample price dictionary for rapid offline / baseline item valuation
   */
  static KNOWN_PRICES = {
    // Operations & Classic Cases
    'Operation Bravo Case': 45.0,
    'CS:GO Weapon Case': 85.0,
    'CS:GO Weapon Case 2': 14.5,
    'CS:GO Weapon Case 3': 8.2,
    'eSports 2013 Case': 48.0,
    'Huntsman Weapon Case': 10.5,
    'Operation Breakout Weapon Case': 7.5,
    'Operation Phoenix Weapon Case': 4.2,
    'Operation Vanguard Weapon Case': 3.8,
    'Operation Wildfire Case': 3.1,
    'Operation Hydra Case': 22.0,
    'Shattered Web Case': 4.8,
    'Fracture Case': 0.75,
    'Dreams & Nightmares Case': 1.1,
    'Recoil Case': 0.65,
    'Revolution Case': 0.55,
    'Kilowatt Case': 1.8,
    
    // Default tier multipliers for generic unlisted skins
    'Covert': 25.0,
    'Classified': 7.5,
    'Restricted': 1.8,
    'Mil-Spec Grade': 0.45,
    'Industrial Grade': 0.15,
    'Consumer Grade': 0.05
  };

  /**
   * Probes Faceit for a given SteamID64
   * @param {string} steamid 
   * @returns {Promise<Object>}
   */
  static async collectFaceit(steamid) {
    const faceit = {
      registered: false,
      nickname: null,
      level: 0,
      elo: 0,
      matches: 0,
      winRate: 0,
      url: `https://www.faceit.com/en/players-modal/${steamid}`
    };

    try {
      // 1. Search player on Faceit open API
      const faceitToken = process.env.FACEIT_API_KEY;
      const headers = faceitToken ? { Authorization: `Bearer ${faceitToken}` } : {};
      const res = await fetch(`https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamid}`, {
        headers
      }).catch(() => null);

      if (res && res.status === 200) {
        const data = await res.json();
        faceit.registered = true;
        faceit.nickname = data.nickname || null;
        faceit.level = data.games?.cs2?.skill_level || data.games?.csgo?.skill_level || 1;
        faceit.elo = data.games?.cs2?.faceit_elo || data.games?.csgo?.faceit_elo || 1000;
        faceit.url = `https://www.faceit.com/en/players/${data.nickname}`;
      } else {
        // Fallback probe via direct nickname check
        const fbRes = await fetch(`https://api.faceit.com/users/v1/nicknames/${steamid}`).catch(() => null);
        if (fbRes && fbRes.status === 200) {
          const fbData = await fbRes.json();
          if (fbData && fbData.result) {
            faceit.registered = true;
            faceit.nickname = fbData.result.nickname;
          }
        }
      }
    } catch (err) {
      // Faceit probe non-blocking
    }

    return faceit;
  }

  /**
   * Parses CS2 Inventory, categorizes medals, cases, knives, skins and calculates market worth
   * @param {string} steamid 
   * @returns {Promise<Object>}
   */
  static async collectCS2Inventory(steamid) {
    const cs2Data = {
      steamid,
      isInventoryPublic: false,
      totalItems: 0,
      inventoryWorthUsd: 0,
      inventoryWorthRub: 0,
      medalsCount: 0,
      medals: [],
      casesCount: 0,
      cases: [],
      knivesCount: 0,
      knives: [],
      glovesCount: 0,
      gloves: [],
      topValuableItems: [],
      hasRareOldMedals: false,
      hasExpensiveCases: false
    };

    try {
      const res = await fetch(`https://steamcommunity.com/inventory/${steamid}/730/2?l=english&count=5000`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
      });

      if (res.status === 200) {
        const data = await res.json();
        if (data && Array.isArray(data.descriptions)) {
          cs2Data.isInventoryPublic = true;
          cs2Data.totalItems = data.descriptions.length;

          let totalWorth = 0;
          const allItems = [];

          for (const item of data.descriptions) {
            const name = item.market_name || item.name || '';
            const type = item.type || '';
            const tags = item.tags || [];
            const iconUrl = item.icon_url ? `https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}/330x192` : null;

            let itemPrice = this.KNOWN_PRICES[name] || 0;

            // Check item rarity tag
            const rarityTag = tags.find(t => t.category === 'Rarity' || t.category_name === 'Quality');
            const rarity = rarityTag ? rarityTag.localized_tag_name || rarityTag.name : '';

            // Categorize Medals
            const isMedal = type.includes('Collectible') || 
                            type.includes('Medal') || 
                            type.includes('Coin') || 
                            type.includes('Pin') || 
                            name.includes('Service Medal') || 
                            name.includes('Veteran Coin') || 
                            name.includes('Trophy') ||
                            name.includes('Badge');

            if (isMedal) {
              cs2Data.medals.push({
                name,
                type,
                iconUrl,
                year: name.match(/20\d\d/)?.[0] || null
              });

              // Check for 5/10 yr veteran or vintage service medals (2015-2019)
              if (name.includes('5 Year') || name.includes('10 Year') || name.includes('2015') || name.includes('2016') || name.includes('2017') || name.includes('2018')) {
                cs2Data.hasRareOldMedals = true;
              }
              // Medals don't add market price directly, but increase account tier value
              continue;
            }

            // Categorize Knives & Gloves
            const isKnife = type.includes('Knife') || name.includes('★') || name.includes('Karambit') || name.includes('Butterfly') || name.includes('M9 Bayonet') || name.includes('Bayonet') || name.includes('Flip Knife') || name.includes('Gut Knife');
            const isGlove = type.includes('Gloves') || name.includes('Sport Gloves') || name.includes('Specialist Gloves') || name.includes('Driver Gloves') || name.includes('Hand Wraps');

            if (isKnife) {
              itemPrice = itemPrice > 0 ? itemPrice : 120.0; // conservative knife base
              cs2Data.knives.push({ name, price: itemPrice, iconUrl });
            } else if (isGlove) {
              itemPrice = itemPrice > 0 ? itemPrice : 95.0; // conservative glove base
              cs2Data.gloves.push({ name, price: itemPrice, iconUrl });
            }

            // Categorize Cases & Containers
            const isContainer = type.includes('Container') || name.includes('Case') || name.includes('Capsule') || name.includes('Package');
            if (isContainer) {
              itemPrice = itemPrice > 0 ? itemPrice : 0.85;
              cs2Data.cases.push({ name, price: itemPrice, iconUrl });
              if (itemPrice >= 4.0) {
                cs2Data.hasExpensiveCases = true;
              }
            } else if (!isKnife && !isGlove && itemPrice === 0 && rarity) {
              // Estimate based on skin rarity tier
              for (const [tier, tierPrice] of Object.entries(this.KNOWN_PRICES)) {
                if (rarity.includes(tier)) {
                  itemPrice = tierPrice;
                  break;
                }
              }
            }

            totalWorth += itemPrice;
            allItems.push({
              name,
              type,
              rarity,
              priceUsd: Number(itemPrice.toFixed(2)),
              iconUrl
            });
          }

          cs2Data.medalsCount = cs2Data.medals.length;
          cs2Data.casesCount = cs2Data.cases.length;
          cs2Data.knivesCount = cs2Data.knives.length;
          cs2Data.glovesCount = cs2Data.gloves.length;
          cs2Data.inventoryWorthUsd = Number(totalWorth.toFixed(2));
          cs2Data.inventoryWorthRub = Math.round(totalWorth * 90);

          // Sort and pick top valuable items
          cs2Data.topValuableItems = allItems
            .sort((a, b) => b.priceUsd - a.priceUsd)
            .slice(0, 8);
        }
      }
    } catch (err) {
      console.warn(`[CS2FaceitCollector] CS2 Inventory parse error for ${steamid}: ${err.message}`);
    }

    return cs2Data;
  }

  /**
   * Full stage 3 collector execution
   * @param {Object} account 
   * @returns {Promise<Object>}
   */
  static async auditStage3(account) {
    const cs2 = await this.collectCS2Inventory(account.steamid);
    const faceit = await this.collectFaceit(account.steamid);

    return {
      ...account,
      cs2,
      faceit
    };
  }
}
