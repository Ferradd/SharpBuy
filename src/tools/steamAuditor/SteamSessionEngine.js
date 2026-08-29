/**
 * SharpBuy Steam Auditor - Steam Session & Token Parser Engine (Updated with Level & Badges)
 */

export class SteamSessionEngine {
  static parseToken(rawString) {
    if (!rawString || typeof rawString !== 'string') return null;
    const cleanStr = rawString.trim();

    let steamid = '';
    let jwt = '';

    if (cleanStr.includes('----')) {
      const parts = cleanStr.split('----');
      steamid = parts[0].trim();
      jwt = parts[1].trim();
    } else if (cleanStr.startsWith('ey')) {
      jwt = cleanStr;
    } else {
      const idMatch = cleanStr.match(/7656119\d{10}/);
      if (idMatch) steamid = idMatch[0];
    }

    let jwtPayload = null;
    let jwtHeader = null;

    if (jwt && jwt.includes('.')) {
      try {
        const parts = jwt.split('.');
        jwtHeader = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
        jwtPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (!steamid && jwtPayload.sub) {
          steamid = jwtPayload.sub;
        }
      } catch (err) {
        console.warn(`[SteamSessionEngine] Failed to decode JWT: ${err.message}`);
      }
    }

    if (!steamid) return null;

    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = jwtPayload?.exp || 0;
    const isExpired = expSec > 0 && expSec < nowSec;
    const daysRemaining = expSec > 0 ? Math.max(0, Math.round((expSec - nowSec) / 86400)) : null;

    return {
      steamid,
      jwt,
      jwtHeader,
      jwtPayload,
      tokenMeta: {
        issuedAt: jwtPayload?.iat ? new Date(jwtPayload.iat * 1000).toISOString() : null,
        expiresAt: expSec > 0 ? new Date(expSec * 1000).toISOString() : null,
        daysRemaining,
        isExpired,
        audience: jwtPayload?.aud || [],
        ipSubject: jwtPayload?.ip_subject || null,
        jti: jwtPayload?.jti || null
      }
    };
  }

  static async fetchLiveProfile(steamid) {
    const profile = {
      steamid,
      nickname: 'Unknown',
      realname: '',
      avatar: 'https://avatars.fastly.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
      profileUrl: `https://steamcommunity.com/profiles/${steamid}`,
      customUrl: null,
      onlineState: 'offline',
      privacyState: 'private',
      isPublic: false,
      memberSince: null,
      accountAgeYears: 0,
      steamLevel: 0,
      xp: 0,
      badgesCount: 0,
      vacBanned: false,
      tradeBanState: 'None',
      isLimitedAccount: false,
      rawXmlAvailable: false
    };

    // 1. Profile XML
    try {
      const res = await fetch(`https://steamcommunity.com/profiles/${steamid}/?xml=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (res.status === 200) {
        const xml = await res.text();
        profile.rawXmlAvailable = true;

        const nameMatch = xml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
        const realNameMatch = xml.match(/<realname><!\[CDATA\[(.*?)\]\]><\/realname>/);
        const avatarMatch = xml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
        const customUrlMatch = xml.match(/<customURL><!\[CDATA\[(.*?)\]\]><\/customURL>/);
        const onlineStateMatch = xml.match(/<onlineState>(.*?)<\/onlineState>/);
        const privacyMatch = xml.match(/<privacyState>(.*?)<\/privacyState>/);
        const memberSinceMatch = xml.match(/<memberSince><!\[CDATA\[(.*?)\]\]><\/memberSince>/);
        const vacMatch = xml.match(/<vacBanned>(\d+)<\/vacBanned>/);
        const tradeBanMatch = xml.match(/<tradeBanState>(.*?)<\/tradeBanState>/);
        const isLimitedMatch = xml.match(/<isLimitedAccount>(\d+)<\/isLimitedAccount>/);

        if (nameMatch) profile.nickname = nameMatch[1];
        if (realNameMatch) profile.realname = realNameMatch[1];
        if (avatarMatch) profile.avatar = avatarMatch[1];
        if (customUrlMatch && customUrlMatch[1]) profile.customUrl = customUrlMatch[1];
        if (onlineStateMatch) profile.onlineState = onlineStateMatch[1];
        if (privacyMatch) {
          profile.privacyState = privacyMatch[1];
          profile.isPublic = privacyMatch[1].toLowerCase() === 'public';
        }
        if (memberSinceMatch) {
          profile.memberSince = memberSinceMatch[1];
          const regDate = new Date(memberSinceMatch[1]);
          if (!isNaN(regDate.getTime())) {
            const ageMs = Date.now() - regDate.getTime();
            profile.accountAgeYears = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
          }
        }
        if (vacMatch) profile.vacBanned = vacMatch[1] === '1';
        if (tradeBanMatch) profile.tradeBanState = tradeBanMatch[1];
        if (isLimitedMatch) profile.isLimitedAccount = isLimitedMatch[1] === '1';
      }
    } catch (err) {
      console.warn(`[SteamSessionEngine] Profile XML error for ${steamid}: ${err.message}`);
    }

    // 2. Badges & Steam Level HTML Page
    try {
      const bRes = await fetch(`https://steamcommunity.com/profiles/${steamid}/badges/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (bRes.status === 200) {
        const bHtml = await bRes.text();
        const levelMatch = bHtml.match(/class="friendPlayerLevelNum">(\d+)<\/span>/i) || bHtml.match(/persona_name persona_level">.*?(\d+)/is);
        const xpMatch = bHtml.match(/(\d+)\s+XP/i);
        const badgesMatch = bHtml.match(/badge_count">.*?(\d+)/is) || bHtml.match(/(\d+)\s+badges/i);

        if (levelMatch) profile.steamLevel = parseInt(levelMatch[1], 10) || 0;
        if (xpMatch) profile.xp = parseInt(xpMatch[1], 10) || 0;
        if (badgesMatch) profile.badgesCount = parseInt(badgesMatch[1], 10) || 0;
      }
    } catch (err) {
      console.warn(`[SteamSessionEngine] Badges level error for ${steamid}: ${err.message}`);
    }

    return profile;
  }
}
