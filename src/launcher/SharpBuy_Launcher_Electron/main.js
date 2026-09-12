const path = require('path');
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const steam = require('./src/steam-mac');
const accounts = require('./src/accounts');
const api = require('./src/api');

const isMac = process.platform === 'darwin';
let mainWindow = null;

function uiIndexPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'ui', 'index.html');
  }
  return path.join(__dirname, 'ui', 'index.html');
}

function createWindow() {
  const winOptions = {
    width: 600,
    height: 440,
    minWidth: 600,
    minHeight: 440,
    show: false,
    transparent: true,
    backgroundColor: '#00000000',
    fullscreenable: false,
    title: 'SharpBuy NFA Launcher',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  };

  if (isMac) {
    Object.assign(winOptions, {
      titleBarStyle: 'hidden',
      maximizable: false,
      trafficLightPosition: { x: 16, y: 16 },
    });
  } else {
    Object.assign(winOptions, {
      frame: false,
      titleBarStyle: 'hidden',
    });
  }

  mainWindow = new BrowserWindow(winOptions);
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.loadFile(uiIndexPath());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getMainWindow() {
  return BrowserWindow.getFocusedWindow() || mainWindow;
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

async function setWindowSizeAnimated(win, width, height, durationMs) {
  const startBounds = win.getBounds();
  const startW = startBounds.width;
  const startH = startBounds.height;
  const targetW = Math.round(width);
  const targetH = Math.round(height);
  const duration = Math.max(1, durationMs || 320);
  const started = Date.now();

  return new Promise((resolve) => {
    const tick = () => {
      const elapsed = Date.now() - started;
      const t = elapsed >= duration ? 1 : easeInOutQuad(elapsed / duration);
      const w = Math.round(startW + (targetW - startW) * t);
      const h = Math.round(startH + (targetH - startH) * t);
      win.setBounds({ ...startBounds, width: w, height: h });
      if (t >= 1) {
        win.setSize(targetW, targetH);
        resolve();
      } else {
        setTimeout(tick, 16);
      }
    };
    tick();
  });
}

function notifyRenderer(webContents, js) {
  if (!webContents || webContents.isDestroyed()) return;
  webContents.executeJavaScript(js).catch(() => {});
}

function registerIpc() {
  ipcMain.handle('ping-backend', () => 'ok');

  ipcMain.handle('get-steam-path', () => steam.getSteamPath());

  ipcMain.handle('get-saved-accounts', () => accounts.getSavedAccountsJson());

  ipcMain.handle('check-token', (_e, rawToken) => {
    const p = steam.parseToken(rawToken);
    return JSON.stringify({
      valid: p.valid,
      secondsRemaining: p.secondsRemaining,
      steamId: p.steamId,
      accountName: p.accountName,
    });
  });

  ipcMain.handle('launch-steam', async (event, tokenInput) => {
    const result = await steam.injectTokenAndLaunch(tokenInput);
    if (result.success) {
      const parsed = steam.parseToken(tokenInput);
      try {
        await api.saveAccountFromToken(result.steamId, result.accountName, tokenInput, parsed);
      } catch (err) {
        console.error('[SharpBuy] save account after launch failed:', err);
      }
      notifyRenderer(
        event.sender,
        `typeof onLoginSuccess==='function'&&onLoginSuccess(${JSON.stringify(result.steamId)}, ${JSON.stringify(result.accountName)}, ${JSON.stringify(result.message)})`
      );
    } else {
      notifyRenderer(
        event.sender,
        `typeof setStatus==='function'&&setStatus('error', 'LOGIN FAILED', ${JSON.stringify(result.message || 'Login failed')})`
      );
    }
    return JSON.stringify(result);
  });

  ipcMain.handle('check-account-live-async', async (_e, rawToken, steamId) =>
    api.checkAccountLive(rawToken, steamId)
  );

  ipcMain.handle('get-account-library-async', async (_e, rawToken) => api.getAccountLibrary(rawToken));

  ipcMain.handle('save-account', async (_e, steamId, accountName, token) => {
    const parsed = steam.parseToken(token);
    await api.saveAccountFromToken(steamId, accountName, token, parsed);
  });

  ipcMain.handle('refresh-all-warranties-async', async () => api.refreshAllWarranties());

  ipcMain.handle('refresh-all-profiles-async', async () => api.refreshAllProfiles());

  ipcMain.handle('delete-saved-account', (_e, steamId) => {
    accounts.deleteAccount(steamId);
  });

  ipcMain.handle('clear-all-saved-accounts', () => {
    accounts.clearAll();
  });

  ipcMain.handle('import-tokens-from-file-async', async () => {
    const win = getMainWindow();
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'Text', extensions: ['txt', 'log', 'csv'] }],
    });

    if (canceled || !filePaths.length) {
      return JSON.stringify({ success: false, cancelled: true });
    }

    let fileContent;
    try {
      fileContent = fs.readFileSync(filePaths[0], 'utf8');
    } catch (_) {
      return JSON.stringify({ success: false, error: 'Could not read file' });
    }

    const re = steam.tokenRegex();
    const tokens = [];
    const seen = new Set();
    let match;
    while ((match = re.exec(fileContent)) !== null) {
      const t = match[0];
      if (!seen.has(t)) {
        seen.add(t);
        tokens.push(t);
      }
    }

    if (!tokens.length) {
      return JSON.stringify({
        success: false,
        error: 'No Steam tokens found. Expected: 7656119XXXXXXXXX----ey...',
      });
    }

    const list = accounts.loadAccounts();
    const existing = new Set(list.map((a) => a.SteamId));
    let imported = 0;
    let skipped = 0;

    for (const token of tokens) {
      const parsed = steam.parseToken(token);
      if (!parsed.valid) {
        skipped += 1;
        continue;
      }
      if (existing.has(parsed.steamId)) {
        skipped += 1;
        continue;
      }

      const fullToken = token.includes('----') ? token : `${parsed.steamId}----${token}`;
      const profile = await api.fetchSteamProfile(parsed.steamId);
      const now = Math.floor(Date.now() / 1000);

      list.unshift(
        accounts.makeAccount({
          steamId: parsed.steamId,
          accountName: parsed.accountName,
          personaName: profile.persona,
          avatarUrl: profile.avatar,
          token: fullToken,
          addedAt: now,
          expSeconds: parsed.secondsRemaining,
          statusMessage: 'Imported',
          vacBanned: profile.vac,
        })
      );
      existing.add(parsed.steamId);
      imported += 1;
      if (list.length >= accounts.MAX_ACCOUNTS) break;
    }

    try {
      accounts.saveAccounts(list);
    } catch (_) {
      return JSON.stringify({ success: false, error: 'Failed to save accounts' });
    }

    return JSON.stringify({
      success: true,
      imported,
      skipped,
      totalFound: imported + skipped,
      inHistory: list.length,
    });
  });

  ipcMain.handle('reset-steam', () => steam.resetSteamData());

  ipcMain.handle('clear-all-steam-sessions', () => steam.clearAllSteamSessions());

  ipcMain.handle('kill-steam', () => {
    steam.killSteamProcesses();
  });

  ipcMain.handle('open-steam-dir', () => {
    steam.openSteamDir();
  });

  ipcMain.handle('open-browser', async (_e, url) => {
    await shell.openExternal(url);
  });

  ipcMain.handle('change-path', async () => {
    const win = getMainWindow();
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });
    if (canceled || !filePaths.length) return null;
    const picked = filePaths[0];
    steam.setSteamPath(picked);
    return picked;
  });

  ipcMain.handle('set-window-size', (_e, width, height) => {
    const win = getMainWindow();
    if (win) win.setSize(Math.round(width), Math.round(height));
  });

  ipcMain.handle('set-window-size-animated', async (_e, width, height, durationMs) => {
    const win = getMainWindow();
    if (win) await setWindowSizeAnimated(win, width, height, durationMs);
  });

  ipcMain.handle('minimize', () => {
    const win = getMainWindow();
    if (win) win.minimize();
  });

  ipcMain.handle('minimize-animated', async () => {
    const win = getMainWindow();
    if (win) win.minimize();
  });

  ipcMain.handle('close-app', () => {
    const win = getMainWindow();
    if (win) win.close();
  });

  ipcMain.handle('on-drag-window', () => {
    // macOS Electron uses -webkit-app-region drag in the patched UI.
  });

  ipcMain.handle('get-cached-games', () => accounts.getCachedGamesJson());

  ipcMain.handle('save-cached-games', (_e, json) => {
    accounts.saveCachedGames(json);
  });
}

app.whenReady().then(() => {
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
