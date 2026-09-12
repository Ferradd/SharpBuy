const { contextBridge, ipcRenderer } = require('electron');

let readyResolve;
let readyDone = false;

const bridgeReady = new Promise((resolve) => {
  readyResolve = (bridge) => {
    if (!readyDone) {
      readyDone = true;
      resolve(bridge);
    }
  };
});

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

const sharpBuyBridge = {
  Ping: () => invoke('ping-backend'),

  GetSteamPath: () => invoke('get-steam-path'),
  GetSavedAccounts: () => invoke('get-saved-accounts'),
  CheckToken: (rawToken) => invoke('check-token', rawToken),

  LaunchSteam: (tokenInput) => invoke('launch-steam', tokenInput),

  CheckAccountLiveAsync: (rawToken, steamId) => invoke('check-account-live-async', rawToken, steamId),
  GetAccountLibraryAsync: (rawToken) => invoke('get-account-library-async', rawToken),
  SaveAccount: (steamId, accountName, token) => invoke('save-account', steamId, accountName, token),

  RefreshAllWarrantiesAsync: async () => {
    await invoke('refresh-all-warranties-async');
    if (typeof loadAccountHistory === 'function') loadAccountHistory();
  },
  RefreshAllProfilesAsync: async () => {
    await invoke('refresh-all-profiles-async');
    if (typeof loadAccountHistory === 'function') loadAccountHistory();
  },

  DeleteSavedAccount: (steamId) => invoke('delete-saved-account', steamId),
  ClearAllSavedAccounts: () => invoke('clear-all-saved-accounts'),
  ImportTokensFromFileAsync: () => invoke('import-tokens-from-file-async'),

  ResetSteam: () => invoke('reset-steam'),
  ClearAllSteamSessions: () => invoke('clear-all-steam-sessions'),
  KillSteam: () => invoke('kill-steam'),
  OpenSteamDir: () => invoke('open-steam-dir'),
  OpenBrowser: (url) => invoke('open-browser', url),

  ChangePath: async () => {
    const picked = await invoke('change-path');
    if (picked && typeof updateSteamPathDisplay === 'function') updateSteamPathDisplay(picked);
  },

  SetWindowSize: (w, h) => invoke('set-window-size', w, h),
  SetWindowSizeAnimated: (w, h, ms) => invoke('set-window-size-animated', w, h, ms || 320),

  MinimizeAnimated: () => invoke('minimize-animated'),
  Minimize: () => invoke('minimize'),
  Close: () => invoke('close-app'),
  OnDragWindow: () => invoke('on-drag-window'),

  GetCachedGames: () => invoke('get-cached-games'),
  SaveCachedGames: (json) => invoke('save-cached-games', json),
};

contextBridge.exposeInMainWorld('sharpBuyBridge', sharpBuyBridge);
contextBridge.exposeInMainWorld('sharpBuyBridgeReady', bridgeReady);

readyResolve(sharpBuyBridge);
