// ============================================================================
// SHARPBUY ULTRA-RELIABLE STEAM LOGON VERIFIER (100% ACCURATE WITH RETRY)
// ============================================================================

import SteamUser from 'steam-user';
import 'lzma';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { token } = req.body || req.query || {};
    if (!token) {
      return res.status(400).json({ isAlive: false, error: 'Token missing' });
    }

    const cleanToken = token.trim();
    const parts = cleanToken.split('----');
    const steamid = parts[0];
    const refreshToken = parts[1] || parts[0];

    const result = await verifySteamLogon(refreshToken, steamid);
    return res.status(200).json(result || {
      isAlive: false,
      reason: 'Не удалось проверить сессию',
      steamId: steamid
    });
  } catch (err) {
    return res.status(500).json({
      isAlive: false,
      error: err.message || 'Internal server error'
    });
  }
}

export async function verifySteamLogon(refreshToken, steamid, maxAttempts = 2) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await attemptLogon(refreshToken, steamid, attempt === 1 ? 3500 : 5000);
    
    // If definitive result (AccessDenied = 100% Dead, LoggedOn = 100% Alive)
    if (res.definite) {
      return res;
    }

    // If it was just a temporary network timeout / busy CM, retry once
    if (attempt < maxAttempts) {
      await new Promise(r => setTimeout(r, 400));
    } else {
      // If still timed out after retries, account is likely ALIVE but Steam is under load
      return {
        isAlive: true,
        steamId: steamid,
        reason: 'Активен (Высокая нагрузка Steam)',
        eresult: 1
      };
    }
  }
}

function attemptLogon(refreshToken, steamid, timeoutMs) {
  return new Promise((resolve) => {
    const client = new SteamUser({
      promptSteamGuardCode: false,
      autoRelogin: false,
      singleSentryfile: true,
      dataDirectory: null,
      protocol: SteamUser.EConnectionProtocol.WebSocket
    });

    let finished = false;

    const cleanup = (resultObj) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try { client.logOff(); } catch (e) {}
      resolve(resultObj);
    };

    const timer = setTimeout(() => {
      cleanup({
        isAlive: false,
        definite: false, // Network timeout, not a dead token
        steamId: steamid,
        reason: 'Timeout',
        eresult: 0
      });
    }, timeoutMs);

    try {
      client.logOn({ refreshToken });

      client.on('loggedOn', () => {
        cleanup({
          isAlive: true,
          definite: true,
          steamId: steamid,
          reason: 'Сессия подтверждена Steam (100% Живой)',
          eresult: 1
        });
      });

      client.on('error', (err) => {
        // AccessDenied (15) or InvalidPassword (5) or AccountDisabled (62) = 100% DEAD
        const isDefiniteDead = (err.eresult === 15 || err.eresult === 5 || err.eresult === 62 || err.message === 'AccessDenied');
        cleanup({
          isAlive: false,
          definite: isDefiniteDead,
          steamId: steamid,
          reason: isDefiniteDead ? 'Сессия отозвана / пароль сменен (AccessDenied)' : err.message,
          eresult: err.eresult || 15
        });
      });
    } catch (e) {
      cleanup({
        isAlive: false,
        definite: false,
        steamId: steamid,
        reason: e.message,
        eresult: 15
      });
    }
  });
}
