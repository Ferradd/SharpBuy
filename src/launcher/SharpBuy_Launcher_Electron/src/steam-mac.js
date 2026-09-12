const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync, spawn } = require('child_process');

const DEFAULT_STEAM_APP = '/Applications/Steam.app';

let steamPath = detectSteamPath();

function detectSteamPath() {
  if (fs.existsSync(DEFAULT_STEAM_APP)) return DEFAULT_STEAM_APP;
  const userApp = path.join(os.homedir(), 'Applications/Steam.app');
  if (fs.existsSync(userApp)) return userApp;
  return DEFAULT_STEAM_APP;
}

function steamDataDir() {
  return path.join(os.homedir(), 'Library/Application Support/Steam');
}

function localVdfPath() {
  return path.join(steamDataDir(), 'local.vdf');
}

function configDir() {
  return path.join(steamDataDir(), 'config');
}

function registryVdfPath() {
  return path.join(steamDataDir(), 'registry.vdf');
}

function isSteamId(value) {
  return /^7656119\d{10}$/.test(String(value || '').trim());
}

function lookupAccountNameFromConfig(steamId) {
  const filePath = path.join(configDir(), 'config.vdf');
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const re = /"([^"]+)"\s*\{\s*"SteamID"\s+"(\d+)"/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    if (match[2] === steamId) return match[1];
  }
  return null;
}

function lookupAccountNameFromLoginUsers(steamId) {
  const filePath = path.join(configDir(), 'loginusers.vdf');
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const blockRe = new RegExp(`"${steamId}"\\s*\\{([\\s\\S]*?)\\n\\t\\}`, 'm');
  const block = content.match(blockRe);
  if (!block) return null;

  const nameMatch = block[1].match(/"AccountName"\s+"([^"]+)"/);
  return nameMatch ? nameMatch[1] : null;
}

function lookupAccountNameFromSavedAccounts(steamId) {
  try {
    const accounts = require('./accounts');
    const saved = accounts.loadAccounts().find((a) => a.SteamId === steamId);
    if (!saved) return null;
    const name = saved.AccountName || '';
    return name && !isSteamId(name) ? name : null;
  } catch (_) {
    return null;
  }
}

function resolveAccountName(steamId, candidate) {
  const normalized = String(candidate || '').trim().toLowerCase();
  if (normalized && !isSteamId(normalized)) {
    return normalized;
  }

  const fromConfig = lookupAccountNameFromConfig(steamId);
  if (fromConfig) return fromConfig.toLowerCase();

  const fromLoginUsers = lookupAccountNameFromLoginUsers(steamId);
  if (fromLoginUsers) return fromLoginUsers.toLowerCase();

  const fromSaved = lookupAccountNameFromSavedAccounts(steamId);
  if (fromSaved) return fromSaved.toLowerCase();

  if (normalized) return normalized;
  return steamId ? steamId.toLowerCase() : 'account';
}

function getSteamPath() {
  return steamPath;
}

function setSteamPath(p) {
  steamPath = p;
}

function killSteamProcesses() {
  try {
    execSync('killall Steam', { stdio: 'ignore' });
  } catch (_) {}
  try {
    execSync('killall steam_osx', { stdio: 'ignore' });
  } catch (_) {}
  try {
    execSync('killall steamwebhelper', { stdio: 'ignore' });
  } catch (_) {}
}

async function waitForSteamExit(timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      execSync('pgrep -x Steam', { stdio: 'ignore' });
      await new Promise((r) => setTimeout(r, 200));
    } catch (_) {
      return true;
    }
  }
  return false;
}

function launchSteamApp() {
  spawn('open', ['-a', 'Steam'], { detached: true, stdio: 'ignore' }).unref();
}

function fromBase64Url(b64) {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4 !== 0) s += '=';
  return Buffer.from(s, 'base64').toString('utf8');
}

function parseToken(rawToken) {
  const invalid = {
    valid: false,
    secondsRemaining: 0,
    steamId: '',
    accountName: '',
    eya: '',
  };

  const trimmed = rawToken.trim().replace(/[\s\t\n\r]/g, '');
  if (!trimmed) return invalid;

  const parts = trimmed.split('----');
  let eya = '';
  let accountName = '';

  for (const part of parts) {
    if (part.includes('eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.') || part.startsWith('ey')) {
      eya = part;
      if (parts.length > 1 && part !== parts[0]) {
        accountName = parts[0].toLowerCase();
      }
      break;
    }
  }

  if (!eya) return invalid;

  let steamId = '';
  let expSeconds = 0;
  const jwtParts = eya.split('.');
  if (jwtParts.length >= 2) {
    try {
      const payload = JSON.parse(fromBase64Url(jwtParts[1]));
      steamId = payload.sub || '';
      expSeconds = payload.exp || 0;
    } catch (_) {}
  }

  if (!accountName || accountName.length > 50) {
    accountName = steamId || 'account';
  }
  if (accountName.includes('@')) {
    accountName = accountName.split('@')[0] || 'account';
  }
  accountName = resolveAccountName(steamId, accountName);

  const now = Math.floor(Date.now() / 1000);
  const remaining = expSeconds > 0 ? expSeconds - now : 0;

  return {
    valid: true,
    secondsRemaining: remaining,
    steamId,
    accountName,
    eya,
  };
}

function calculateCrc32(bytes) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let temp = i;
    for (let j = 0; j < 8; j++) {
      temp = temp & 1 ? (temp >>> 1) ^ 0xedb88320 : temp >>> 1;
    }
    table[i] = temp >>> 0;
  }

  let crc = 0xffffffff;
  for (const b of bytes) {
    const idx = (crc ^ b) & 0xff;
    crc = (crc >>> 8) ^ table[idx];
  }
  return (~crc) >>> 0;
}

function computeCrc32(input) {
  const hex = calculateCrc32(Buffer.from(input, 'utf8')).toString(16);
  return hex.replace(/^0+/, '');
}

function ensureParent(filePath, content) {
  const parent = path.dirname(filePath);
  fs.mkdirSync(parent, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function updateConfigVdf(filePath, accountName, steamId) {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';

  if (!content.trim()) {
    content = `"InstallConfigStore"
{
\t"Software"
\t{
\t\t"Valve"
\t\t{
\t\t\t"Steam"
\t\t\t{
\t\t\t\t"Accounts"
\t\t\t\t{
\t\t\t\t\t"${accountName}"
\t\t\t\t\t{
\t\t\t\t\t\t"SteamID"\t\t"${steamId}"
\t\t\t\t\t}
\t\t\t\t}
\t\t\t}
\t\t}
\t}
}`;
  } else if (!content.includes(`"${accountName}"`)) {
    const accIdx = content.indexOf('"Accounts"');
    if (accIdx !== -1) {
      const slice = content.slice(accIdx);
      const braceRel = slice.indexOf('{');
      if (braceRel !== -1) {
        const openBrace = accIdx + braceRel;
        const block = `\n\t\t\t\t\t"${accountName}"\n\t\t\t\t\t{\n\t\t\t\t\t\t"SteamID"\t\t"${steamId}"\n\t\t\t\t\t}`;
        content = content.slice(0, openBrace + 1) + block + content.slice(openBrace + 1);
      }
    }
  }

  ensureParent(filePath, content);
}

function updateLoginUsersVdf(filePath, steamId, accountName, timestamp) {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const usesAutoLogin = content.includes('"AutoLogin"');

  if (content) {
    if (usesAutoLogin) {
      content = content.replace(/"AutoLogin"\s+"1"/g, '"AutoLogin"\t\t"0"');
    }
    content = content.replace(/"MostRecent"\s+"1"/g, '"MostRecent"\t\t"0"');
  }

  const userBlock = usesAutoLogin || process.platform === 'darwin'
    ? `\n\t"${steamId}"\n\t{\n\t\t"AccountName"\t\t"${accountName}"\n\t\t"PersonaName"\t\t"${accountName}"\n\t\t"RememberPassword"\t\t"1"\n\t\t"WantsOfflineMode"\t\t"0"\n\t\t"SkipOfflineModeWarning"\t\t"0"\n\t\t"AutoLogin"\t\t"1"\n\t\t"Timestamp"\t\t"${timestamp}"\n\t}`
    : `\n\t"${steamId}"\n\t{\n\t\t"AccountName"\t\t"${accountName}"\n\t\t"PersonaName"\t\t"${accountName}"\n\t\t"RememberPassword"\t\t"1"\n\t\t"WantsOfflineMode"\t\t"0"\n\t\t"SkipOfflineModeWarning"\t\t"0"\n\t\t"AllowAutoLogin"\t\t"1"\n\t\t"MostRecent"\t\t"1"\n\t\t"Timestamp"\t\t"${timestamp}"\n\t}`;

  if (!content.trim() || !content.includes('"users"')) {
    content = `"users"\n{${userBlock}\n}`;
  } else if (!content.includes(`"${steamId}"`)) {
    const usersIdx = content.indexOf('"users"');
    if (usersIdx !== -1) {
      const slice = content.slice(usersIdx);
      const braceRel = slice.indexOf('{');
      if (braceRel !== -1) {
        const openBrace = usersIdx + braceRel;
        content = content.slice(0, openBrace + 1) + userBlock + content.slice(openBrace + 1);
      }
    }
  } else {
    const blockPattern = new RegExp(`("${steamId}"\\s*\\{)([\\s\\S]*?)(\\n\\t\\})`, 'm');
    content = content.replace(blockPattern, (_full, open, body, close) => {
      let next = body;
      const setField = (field, value) => {
        const fieldRe = new RegExp(`"${field}"\\s+"[^"]*"`);
        if (fieldRe.test(next)) {
          next = next.replace(fieldRe, `"${field}"\t\t"${value}"`);
        } else {
          next += `\n\t\t"${field}"\t\t"${value}"`;
        }
      };

      setField('AccountName', accountName);
      setField('PersonaName', accountName);
      setField('RememberPassword', '1');
      setField('Timestamp', String(timestamp));

      if (usesAutoLogin || process.platform === 'darwin') {
        setField('AutoLogin', '1');
      } else {
        setField('AllowAutoLogin', '1');
        setField('MostRecent', '1');
      }

      return `${open}${next}${close}`;
    });
  }

  ensureParent(filePath, content);
}

function updateRegistryAutoLoginUser(accountName) {
  const filePath = registryVdfPath();
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove ALL AutoLoginUser entries first
  content = content.replace(/"AutoLoginUser"\s+"[^"]*"/g, '"AutoLoginUser"\t\t""');
  
  // Then add the correct one in HKCU section
  const hkcuIdx = content.indexOf('"HKCU"');
  if (hkcuIdx !== -1) {
    const steamIdx = content.indexOf('"Steam"', hkcuIdx);
    if (steamIdx !== -1) {
      const slice = content.slice(steamIdx);
      const braceRel = slice.indexOf('{');
      if (braceRel !== -1) {
        const openBrace = steamIdx + braceRel;
        const newEntry = `\n\t\t\t\t\t"AutoLoginUser"\t\t"${accountName}"`;
        content = content.slice(0, openBrace + 1) + newEntry + content.slice(openBrace + 1);
      }
    }
  }

  ensureParent(filePath, content);
}

function updateLocalVdf(filePath, crc32Key, encryptedJwtHex) {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';

  if (!content.trim() || !content.includes('"ConnectCache"')) {
    content = `"MachineUserConfigStore"
{
\t"Software"
\t{
\t\t"Valve"
\t\t{
\t\t\t"Steam"
\t\t\t{
\t\t\t\t"ConnectCache"
\t\t\t\t{
\t\t\t\t\t"${crc32Key}"\t\t"${encryptedJwtHex}"
\t\t\t\t}
\t\t\t}
\t\t}
\t}
}`;
  } else {
    const cacheIdx = content.indexOf('"ConnectCache"');
    if (cacheIdx !== -1) {
      const slice = content.slice(cacheIdx);
      const braceRel = slice.indexOf('{');
      if (braceRel !== -1) {
        const openBrace = cacheIdx + braceRel;
        if (content.includes(`"${crc32Key}"`)) {
          const pattern = new RegExp(`("${crc32Key}"\\s+")[^"]+(")`, 'g');
          content = content.replace(pattern, `$1${encryptedJwtHex}$2`);
        } else {
          const entry = `\n\t\t\t\t\t"${crc32Key}"\t\t"${encryptedJwtHex}"`;
          content = content.slice(0, openBrace + 1) + entry + content.slice(openBrace + 1);
        }
      }
    }
  }

  ensureParent(filePath, content);
}

function aes256EcbEncryptNoPad(data, key) {
  const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(data), cipher.final()]);
}

function aes256EcbDecryptNoPad(data, key) {
  const decipher = crypto.createDecipheriv('aes-256-ecb', key, null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

function aes256CbcEncrypt(data, key, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
}

function aes256CbcDecrypt(data, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

function steamEncryptMac(jwt, accountName) {
  const key = crypto.createHash('sha256').update(accountName, 'utf8').digest();
  const iv = crypto.randomBytes(16);
  const encryptedIv = aes256EcbEncryptNoPad(iv, key);
  const encryptedData = aes256CbcEncrypt(jwt, key, iv);
  return Buffer.concat([encryptedIv, encryptedData]).toString('hex').toLowerCase();
}

function steamDecryptMac(hexBlob, accountName) {
  const data = Buffer.from(hexBlob, 'hex');
  if (data.length < 32) throw new Error('ConnectCache blob too short');
  const key = crypto.createHash('sha256').update(accountName, 'utf8').digest();
  const plainIv = aes256EcbDecryptNoPad(data.subarray(0, 16), key);
  return aes256CbcDecrypt(data.subarray(16), key, plainIv).toString('utf8');
}

function injectTokenAndLaunch(rawToken) {
  const parsed = parseToken(rawToken);
  const fail = (message) => ({
    success: false,
    message,
    steamId: parsed.steamId,
    accountName: parsed.accountName,
  });

  if (!parsed.valid) return Promise.resolve(fail('Invalid token format.'));
  if (parsed.secondsRemaining <= 0) return Promise.resolve(fail('This token has expired.'));

  const days = Math.floor(parsed.secondsRemaining / 86400);
  const hours = Math.floor((parsed.secondsRemaining % 86400) / 3600);
  const mins = Math.floor((parsed.secondsRemaining % 3600) / 60);

  killSteamProcesses();

  return waitForSteamExit(3000).then(async () => {
    let encryptedJwtHex;
    try {
      encryptedJwtHex = steamEncryptMac(parsed.eya, parsed.accountName);
    } catch (e) {
      return fail(`Encryption failed: ${e.message}`);
    }

    try {
      updateConfigVdf(path.join(configDir(), 'config.vdf'), parsed.accountName, parsed.steamId);
    } catch (e) {
      return fail(`Failed to update config.vdf: ${e.message}`);
    }

    const now = Math.floor(Date.now() / 1000);
    try {
      updateLoginUsersVdf(path.join(configDir(), 'loginusers.vdf'), parsed.steamId, parsed.accountName, now);
    } catch (e) {
      return fail(`Failed to update loginusers.vdf: ${e.message}`);
    }

    try {
      updateRegistryAutoLoginUser(parsed.accountName);
    } catch (e) {
      return fail(`Failed to update registry.vdf: ${e.message}`);
    }

    const crc32Key = `${computeCrc32(parsed.accountName)}1`;
    try {
      updateLocalVdf(localVdfPath(), crc32Key, encryptedJwtHex);
    } catch (e) {
      return fail(`Failed to update local.vdf: ${e.message}`);
    }

    if (!fs.existsSync(getSteamPath())) {
      return fail(`Steam not found at: ${getSteamPath()}`);
    }

    try {
      launchSteamApp();
    } catch (e) {
      return fail(`Failed to launch Steam: ${e.message}`);
    }

    return {
      success: true,
      message: `Token valid for ${days} days, ${hours} hrs, ${mins} mins.`,
      steamId: parsed.steamId,
      accountName: parsed.accountName,
    };
  });
}

function resetSteamData() {
  killSteamProcesses();
  const localVdf = localVdfPath();
  if (fs.existsSync(localVdf)) {
    try {
      fs.unlinkSync(localVdf);
      return true;
    } catch (_) {
      return false;
    }
  }
  return true;
}

function clearAllSteamSessions() {
  killSteamProcesses();
  const localVdf = localVdfPath();
  if (!fs.existsSync(localVdf)) return true;

  try {
    let content = fs.readFileSync(localVdf, 'utf8');
    content = content.replace(/"ConnectCache"[\s\S]*?\{[\s\S]*?\}/, '"ConnectCache"\n\t\t\t\t{\n\t\t\t\t}');
    fs.writeFileSync(localVdf, content, 'utf8');
    return true;
  } catch (_) {
    return false;
  }
}

function openSteamDir() {
  spawn('open', [steamDataDir()], { detached: true, stdio: 'ignore' }).unref();
}

function tokenRegex() {
  return /7656119\d+----ey[A-Za-z0-9_\-.]+/g;
}

module.exports = {
  parseToken,
  injectTokenAndLaunch,
  getSteamPath,
  setSteamPath,
  killSteamProcesses,
  resetSteamData,
  clearAllSteamSessions,
  openSteamDir,
  steamDataDir,
  tokenRegex,
  computeCrc32,
  steamEncryptMac,
  steamDecryptMac,
  resolveAccountName,
  updateRegistryAutoLoginUser,
};
