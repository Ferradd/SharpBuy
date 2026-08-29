/**
 * SharpBuy Steam Auditor - Wallet, Points & Security Collector
 * Analyzes wallet balances, Steam Points, security bans (VAC, Trade, Community) and Limited account status.
 */

export class WalletSecurityCollector {
  /**
   * Evaluates Steam Points value in USD and RUB
   * Standard market rate: ~10,000 pts = $1.50 USD (~135 RUB)
   * @param {number} points 
   * @returns {Object}
   */
  static estimatePointsWorth(points = 0) {
    if (!points || points <= 0) {
      return { points: 0, worthUsd: 0, worthRub: 0 };
    }
    const worthUsd = Number(((points / 10000) * 1.5).toFixed(2));
    const worthRub = Math.round(worthUsd * 90);
    return { points, worthUsd, worthRub };
  }

  /**
   * Fetches security, ban details, limited status and region for a SteamID
   * @param {string} steamid 
   * @param {Object} rawXmlData 
   * @returns {Promise<Object>}
   */
  static async collectSecurityAndBans(steamid, existingProfile = null) {
    const security = {
      steamid,
      vacBanned: false,
      communityBanned: false,
      tradeBanState: 'None',
      economyBanned: false,
      isLimited: false,
      country: 'Unknown',
      memberSince: null,
      accountAgeYears: 0,
      riskScore: 0,
      safetyStatus: 'CLEAN'
    };

    try {
      let xmlText = '';
      if (existingProfile && existingProfile.rawXmlAvailable) {
        // reuse existing profile if passed
        security.vacBanned = Boolean(existingProfile.vacBanned);
        security.tradeBanState = existingProfile.tradeBanState || 'None';
        security.isLimited = Boolean(existingProfile.isLimitedAccount);
        security.memberSince = existingProfile.memberSince || null;
        security.accountAgeYears = existingProfile.accountAgeYears || 0;
      }

      // Fetch fresh profile XML to ensure full fields
      const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/?xml=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (res.status === 200) {
        xmlText = await res.text();
        
        const vacMatch = xmlText.match(/<vacBanned>(\d+)<\/vacBanned>/);
        const tradeMatch = xmlText.match(/<tradeBanState>(.*?)<\/tradeBanState>/);
        const isLimitedMatch = xmlText.match(/<isLimitedAccount>(\d+)<\/isLimitedAccount>/);
        const locationMatch = xmlText.match(/<location><!\[CDATA\[(.*?)\]\]><\/location>/);
        const memberSinceMatch = xmlText.match(/<memberSince><!\[CDATA\[(.*?)\]\]><\/memberSince>/);

        if (vacMatch) security.vacBanned = vacMatch[1] === '1';
        if (tradeMatch) {
          security.tradeBanState = tradeMatch[1];
          security.economyBanned = tradeMatch[1].toLowerCase() !== 'none';
        }
        if (isLimitedMatch) security.isLimited = isLimitedMatch[1] === '1';
        if (locationMatch && locationMatch[1]) security.country = locationMatch[1].trim();

        if (memberSinceMatch) {
          security.memberSince = memberSinceMatch[1];
          const regDate = new Date(memberSinceMatch[1]);
          if (!isNaN(regDate.getTime())) {
            const ageMs = Date.now() - regDate.getTime();
            security.accountAgeYears = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
          }
        }
      }

      // Calculate risk score and safety status
      if (security.vacBanned || security.economyBanned) {
        security.riskScore = 100;
        security.safetyStatus = 'BANNED';
      } else if (security.isLimited) {
        security.riskScore = 20;
        security.safetyStatus = 'LIMITED';
      } else {
        security.riskScore = 0;
        security.safetyStatus = 'CLEAN';
      }

    } catch (err) {
      console.warn(`[WalletSecurityCollector] Security fetch error for ${steamid}: ${err.message}`);
    }

    return security;
  }

  /**
   * Collects wallet balance and Steam Points data
   * @param {string} steamid 
   * @param {string} sessionCookie 
   * @returns {Promise<Object>}
   */
  static async collectWalletAndPoints(steamid, sessionCookie = null) {
    const walletData = {
      hasWallet: false,
      balance: 0,
      currency: 'USD',
      formattedBalance: '$0.00 USD',
      pendingBalance: 0,
      points: 0,
      pointsWorthUsd: 0,
      pointsWorthRub: 0
    };

    if (!sessionCookie) {
      // Default estimation when session cookie is not active
      return walletData;
    }

    try {
      // 1. Steam Wallet via Store Account
      const storeRes = await fetch('https://store.steampowered.com/account/', {
        headers: {
          'Cookie': sessionCookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (storeRes.status === 200) {
        const html = await storeRes.text();
        const balMatch = html.match(/class="accountData accountBalance">([^<]+)<\/div>/i) ||
                         html.match(/class="your_account">[^<]*<span class="account_balance">([^<]+)<\/span>/i) ||
                         html.match(/accountData[^\$€₽₺₸0-9]*([$€₽₺₸0-9,.\s]+)/i);

        if (balMatch) {
          walletData.hasWallet = true;
          walletData.formattedBalance = balMatch[1].trim();
          const numeric = parseFloat(balMatch[1].replace(/[^0-9.]/g, ''));
          if (!isNaN(numeric)) walletData.balance = numeric;

          if (balMatch[1].includes('$')) walletData.currency = 'USD';
          else if (balMatch[1].includes('€')) walletData.currency = 'EUR';
          else if (balMatch[1].includes('₽') || balMatch[1].includes('pуб')) walletData.currency = 'RUB';
          else if (balMatch[1].includes('₺') || balMatch[1].includes('TL')) walletData.currency = 'TRY';
          else if (balMatch[1].includes('₸')) walletData.currency = 'KZT';
        }
      }

      // 2. Steam Points via Points Summary API
      const pointsRes = await fetch('https://store.steampowered.com/pointssummary/ajaxgetasyncconfig', {
        headers: {
          'Cookie': sessionCookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      if (pointsRes.status === 200) {
        const pData = await pointsRes.json().catch(() => null);
        if (pData && pData.data && typeof pData.data.points !== 'undefined') {
          walletData.points = parseInt(pData.data.points, 10) || 0;
          const worth = this.estimatePointsWorth(walletData.points);
          walletData.pointsWorthUsd = worth.worthUsd;
          walletData.pointsWorthRub = worth.worthRub;
        }
      }
    } catch (err) {
      console.warn(`[WalletSecurityCollector] Wallet/Points error for ${steamid}: ${err.message}`);
    }

    return walletData;
  }

  /**
   * Full stage 2 collector execution
   * @param {Object} account 
   * @returns {Promise<Object>}
   */
  static async auditStage2(account) {
    const security = await this.collectSecurityAndBans(account.steamid, account.profile);
    const walletPoints = await this.collectWalletAndPoints(account.steamid, account.sessionCookie || null);

    return {
      ...account,
      security,
      wallet: walletPoints
    };
  }
}
