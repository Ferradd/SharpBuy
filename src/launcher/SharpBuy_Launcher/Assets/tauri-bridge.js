/**
 * Tauri bridge — same API as Electron/WebView2 sharpBuyBridge (~5 MB, WKWebView).
 * Must run before DOMContentLoaded so init() sees sharpBuyBridge.
 */
(function () {
  function markPlatform() {
    document.documentElement.classList.add('platform-mac', 'platform-tauri');
    if (document.body) document.body.classList.add('platform-mac', 'platform-tauri');
  }

  function installBridge() {
    var tauri = window.__TAURI__;
    if (!tauri || !tauri.core || typeof tauri.core.invoke !== 'function') {
      return false;
    }

    var invoke = tauri.core.invoke;
    markPlatform();

    window.sharpBuyBridge = {
      GetSteamPath: function () { return invoke('get_steam_path'); },
      GetSavedAccounts: function () { return invoke('get_saved_accounts'); },
      CheckToken: function (rawToken) { return invoke('check_token', { rawToken: rawToken }); },

      LaunchSteam: async function (tokenInput) {
        try {
          setStatus('loading', 'LOGGING IN TO STEAM...', 'Encrypting session and launching Steam client.');
          var raw = await invoke('launch_steam', { tokenInput: tokenInput });
          var result = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (result.success) {
            onLoginSuccess(
              result.steamId || result.steam_id,
              result.accountName || result.account_name,
              result.message
            );
          } else {
            setStatus('error', 'LOGIN FAILED', result.message || 'Login failed');
          }
        } catch (e) {
          setStatus('error', 'LOGIN FAILED', e.message || String(e));
        }
      },

      CheckAccountLiveAsync: function (rawToken, steamId) {
        return invoke('check_account_live_async', { rawToken: rawToken, steamId: steamId });
      },
      GetAccountLibraryAsync: function (rawToken) {
        return invoke('get_account_library_async', { rawToken: rawToken });
      },
      SaveAccount: function (steamId, accountName, token) {
        return invoke('save_account', { steamId: steamId, accountName: accountName, token: token });
      },

      RefreshAllWarrantiesAsync: async function () {
        await invoke('refresh_all_warranties_async');
        loadAccountHistory();
      },
      RefreshAllProfilesAsync: async function () {
        await invoke('refresh_all_profiles_async');
        loadAccountHistory();
      },

      DeleteSavedAccount: function (steamId) { return invoke('delete_saved_account', { steamId: steamId }); },
      ClearAllSavedAccounts: function () { return invoke('clear_all_saved_accounts'); },
      ImportTokensFromFileAsync: function () { return invoke('import_tokens_from_file_async'); },

      ResetSteam: function () { return invoke('reset_steam'); },
      ClearAllSteamSessions: function () { return invoke('clear_all_steam_sessions'); },
      KillSteam: function () { return invoke('kill_steam'); },
      OpenSteamDir: function () { return invoke('open_steam_dir'); },
      OpenBrowser: function (url) { return invoke('open_browser', { url: url }); },

      ChangePath: async function () {
        var path = await invoke('change_path');
        if (path) updateSteamPathDisplay(path);
      },

      SetWindowSize: function (w, h) { return invoke('set_window_size', { width: w, height: h }); },
      SetWindowSizeAnimated: function (w, h, ms) {
        return invoke('set_window_size_animated', { width: w, height: h, durationMs: ms || 320 });
      },

      MinimizeAnimated: function () { return invoke('minimize_animated'); },
      Minimize: function () { return invoke('minimize'); },
      Close: function () { return invoke('close_app'); },
      OnDragWindow: function () { return invoke('start_drag'); },
    };

    return true;
  }

  markPlatform();

  if (!installBridge()) {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (installBridge() || tries > 50) clearInterval(timer);
    }, 20);
  }
})();
