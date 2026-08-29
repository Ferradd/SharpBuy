import fs from 'fs';

const origHtml = fs.readFileSync('c:\\Users\\iliyk\\Desktop\\SharpBuy_Frontend\\index.html', 'utf8');

// Extract the 2 base64 images from origHtml
const img1Match = origHtml.match(/src="(data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6[^"]+)"/);
const img2Match = origHtml.match(/src="(data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAAm4AAABnCAYAAAC5OM7y[^"]+)"/);

const img1Src = img1Match ? img1Match[1] : '';
const img2Src = img2Match ? img2Match[1] : '';

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>SHARPBUY NFA LAUNCHER</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
    user-select: none; 
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  
  html, body {
    background: #11141a;
    color: #e2e8f0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* 1. Header */
  .titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    background: #090b0e;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    height: 48px;
    flex-shrink: 0;
    cursor: move;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-logo-img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    filter: drop-shadow(0 0 4px rgba(255,85,0,0.5));
  }

  .brand-title-img {
    height: 18px;
    object-fit: contain;
    margin-right: 6px;
  }

  .brand-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #ffffff;
    display: flex;
    align-items: center;
  }

  .brand-title span.divider { color: #334155; font-weight: 300; margin-right: 10px; }
  .brand-title span.sub { font-size: 13px; font-weight: 600; color: #94a3b8; letter-spacing: 0.8px; }

  .title-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .history-toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(249, 115, 22, 0.12);
    border: 1px solid rgba(249, 115, 22, 0.35);
    border-radius: 5px;
    padding: 5px 10px;
    color: #fb923c;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .history-toggle-btn:hover {
    background: rgba(249, 115, 22, 0.25);
    border-color: #f97316;
    color: #ffffff;
    box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
  }

  .history-badge {
    background: #f97316;
    color: #090b0e;
    font-size: 10px;
    font-weight: 800;
    border-radius: 10px;
    padding: 1px 6px;
  }

  .window-btns {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: default;
  }

  .win-btn {
    width: 28px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #cbd5e1;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    outline: none;
    transition: all 0.15s;
  }

  .win-btn:hover { 
    background: rgba(255, 255, 255, 0.18); 
    border-color: rgba(255, 255, 255, 0.3);
    color: #ffffff; 
  }

  .win-btn.close-btn:hover { 
    background: #e11d48; 
    border-color: #e11d48;
    color: #ffffff; 
  }

  /* App Workspace */
  .app-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    width: 100%;
    height: calc(100% - 48px);
  }

  /* Left: Main Launcher (Fixed 600px) */
  .main-panel {
    width: 600px;
    min-width: 600px;
    max-width: 600px;
    padding: 14px 22px 12px 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
    height: 100%;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* Right: Expandable History Drawer (360px) */
  .history-drawer {
    width: 360px;
    min-width: 360px;
    background: #0d1015;
    display: none;
    flex-direction: column;
    height: 100%;
    padding: 14px 16px;
    gap: 10px;
    border-left: 1px solid rgba(255, 255, 255, 0.05);
  }

  .history-drawer.active {
    display: flex;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .drawer-title {
    font-size: 13px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .drawer-subtitle {
    font-size: 11px;
    color: #64748b;
  }

  .accounts-list-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 2px;
  }

  .accounts-list-container::-webkit-scrollbar {
    width: 4px;
  }
  .accounts-list-container::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.1);
  }
  .accounts-list-container::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.15);
    border-radius: 4px;
  }

  /* Account Card */
  .acc-card {
    background: #131720;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: all 0.15s;
  }

  .acc-card:hover {
    border-color: rgba(249, 115, 22, 0.4);
    background: #171c26;
  }

  .acc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .acc-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow: hidden;
  }

  .acc-name {
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .acc-id {
    font-size: 10px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }

  .warranty-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }

  .warranty-active {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .warranty-expired {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .acc-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .btn-acc-login {
    flex: 1;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border: none;
    border-radius: 4px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    padding: 5px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.15s;
  }

  .btn-acc-login:hover {
    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
  }

  .btn-acc-check {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #cbd5e1;
    font-size: 10px;
    font-weight: 600;
    padding: 5px 7px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-acc-check:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }

  .btn-acc-claim {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.35);
    border-radius: 4px;
    color: #fca5a5;
    font-size: 10px;
    font-weight: 700;
    padding: 5px 7px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-acc-claim:hover {
    background: #ef4444;
    color: #ffffff;
  }

  .btn-acc-del {
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 12px;
    cursor: pointer;
    padding: 2px 4px;
    transition: color 0.15s;
  }

  .btn-acc-del:hover {
    color: #ef4444;
  }

  .empty-history {
    text-align: center;
    color: #64748b;
    font-size: 11px;
    padding: 30px 10px;
    line-height: 1.5;
  }

  /* Main Controls */
  .section-detect {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .detect-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .detect-title {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  .dot-green {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .detect-path {
    font-size: 11px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    padding-left: 16px;
  }

  .link-action {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-decoration: underline;
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: color 0.2s;
  }

  .link-action:hover { color: #f97316; }

  /* Input */
  .section-input {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex-shrink: 0;
  }

  .input-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .input-label-text {
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  .input-box {
    width: 100%;
    background: #090b0e;
    border: 1.5px solid #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.15);
    border-radius: 6px;
    padding: 10px 14px;
    color: #ffffff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    outline: none;
    user-select: text;
    transition: all 0.2s;
  }

  .input-box:focus {
    box-shadow: 0 0 14px rgba(34, 197, 94, 0.35);
  }

  .input-box::placeholder {
    color: #64748b;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
  }

  /* Main Action Button */
  .btn-log-steam {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border: none;
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .btn-log-steam:hover {
    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
    transform: translateY(-1px);
  }

  .btn-log-steam:active {
    transform: translateY(1px);
  }

  /* Status Box */
  .ready-box {
    background: #090b0e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 9px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
  }

  .ready-header {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  .ready-sub {
    font-size: 11px;
    color: #64748b;
    padding-left: 16px;
  }

  /* Tools */
  .tools-panel {
    width: 100%;
    border-collapse: collapse;
    background: #090b0e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .tool-item {
    padding: 8px 10px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .tool-item:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .tool-icon {
    width: 24px;
    vertical-align: middle;
  }

  .tool-content {
    vertical-align: middle;
    padding-left: 6px;
  }

  .tool-title {
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.4px;
  }

  .tool-desc {
    font-size: 10px;
    color: #64748b;
  }

  /* Footer */
  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .footer-item {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #64748b;
    cursor: pointer;
    transition: color 0.15s;
  }

  .footer-item:hover { color: #cbd5e1; }
  .footer-item.active { color: #f97316; }
  .footer-item.active:hover { color: #fb923c; }
</style>
</head>
<body oncontextmenu="return false;">

  <!-- Header -->
  <div class="titlebar" onmousedown="onTitleMouseDown(event)">
    <div class="brand-group">
      <img src="${img1Src}" class="brand-logo-img" alt="Logo" />
      <img src="${img2Src}" class="brand-title-img" alt="SHARPBUY" />
      <div class="brand-title">
        <span class="divider">|</span>
        <span class="sub">NFA LAUNCHER</span>
      </div>
    </div>
    <div class="title-right">
      <button class="history-toggle-btn" onclick="toggleHistoryDrawer()">
        <span>📋 ИСТОРИЯ</span>
        <span class="history-badge" id="historyCount">0</span>
      </button>
      <div class="window-btns">
        <button class="win-btn" onclick="onMinimize(event)">&#x2212;</button>
        <button class="win-btn close-btn" onclick="onClose(event)">&#x2715;</button>
      </div>
    </div>
  </div>

  <!-- Workspace -->
  <div class="app-layout">
    
    <!-- Left Main Panel -->
    <div class="main-panel">
      <!-- Steam Detection -->
      <div class="section-detect">
        <div class="detect-left">
          <div class="detect-title">
            <div class="dot-green"></div>
            <span>STEAM CLIENT DETECTED</span>
          </div>
          <div class="detect-path" id="steamPathDisplay">C:/Program Files (x86)/Steam</div>
        </div>
        <div class="link-action" onclick="changePath()">CHANGE PATH</div>
      </div>

      <!-- Input -->
      <div class="section-input">
        <div class="input-header">
          <div class="input-label-text">STEAM SESSION NFA TOKEN</div>
          <div class="link-action" onclick="pasteToken()">PASTE FROM BUFFER</div>
        </div>
        <input type="text" class="input-box" id="tokenInput" placeholder="Paste SteamID----jwt or token here..." />
      </div>

      <!-- Main Login Button -->
      <button class="btn-log-steam" onclick="launchSteam()">
        LOG INTO STEAM ACCOUNT  
      </button>

      <!-- Status Box -->
      <div class="ready-box" id="statusBox">
        <div class="ready-header">
          <div class="dot-green" id="statusDot"></div>
          <span id="statusTitle">READY TO USE</span>
        </div>
        <div class="ready-sub" id="statusSub">Insert the NFA token and click "Log in to your Steam account."</div>
      </div>

      <!-- 3 Tools Panel -->
      <table class="tools-panel" cellpadding="0" cellspacing="0">
        <tr>
          <td class="tool-item" onclick="resetSteam()" style="width: 33.3%;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg></td>
                <td class="tool-content">
                  <div class="tool-title">RESET STEAM</div>
                  <div class="tool-desc">Restore login</div>
                </td>
              </tr>
            </table>
          </td>

          <td class="tool-item" onclick="killSteam()" style="width: 33.3%; border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08);">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg></td>
                <td class="tool-content">
                  <div class="tool-title">CLOSE STEAM</div>
                  <div class="tool-desc">End processes</div>
                </td>
              </tr>
            </table>
          </td>

          <td class="tool-item" onclick="openSteamFolder()" style="width: 33.3%;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></td>
                <td class="tool-content">
                  <div class="tool-title">STEAM FOLDER</div>
                  <div class="tool-desc">Open directory</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <div class="footer-row">
        <span class="footer-item" onclick="openUrl('https://sharpbuy.org')">SHARPBUY.ORG</span>
        <span class="footer-item active" onclick="openUrl('https://sharpbuy.org/#nfa-warranty')">AUTO-WARRANTY (3H)</span>
        <span class="footer-item" onclick="openUrl('https://t.me/sharpbuy_support')">24/7 SUPPORT</span>
      </div>
    </div>

    <!-- Right History Drawer -->
    <div class="history-drawer" id="historyDrawer">
      <div class="drawer-header">
        <div>
          <div class="drawer-title">📋 ИСТОРИЯ АККАУНТОВ</div>
          <div class="drawer-subtitle">Вход в 1 клик и статус гарантии</div>
        </div>
        <div class="link-action" onclick="toggleHistoryDrawer()">ЗАКРЫТЬ ✕</div>
      </div>

      <div class="accounts-list-container" id="accountsList">
        <!-- Rendered dynamically -->
      </div>
    </div>

  </div>

  <script>
    let isDrawerOpen = false;
    let savedAccountsCache = [];

    async function getBridge() {
      if (window.chrome && window.chrome.webview && window.chrome.webview.hostObjects) {
        return window.chrome.webview.hostObjects.bridge;
      }
      return null;
    }

    async function init() {
      try {
        const bridge = await getBridge();
        if (bridge) {
          const path = await bridge.GetSteamPath();
          if (path) updateSteamPathDisplay(path);
          await loadAccountHistory();
        }
      } catch (e) {}
    }

    async function toggleHistoryDrawer() {
      isDrawerOpen = !isDrawerOpen;
      const drawer = document.getElementById('historyDrawer');
      const bridge = await getBridge();

      if (isDrawerOpen) {
        drawer.classList.add('active');
        if (bridge) bridge.SetWindowSize(960, 440);
        await loadAccountHistory();
      } else {
        drawer.classList.remove('active');
        if (bridge) bridge.SetWindowSize(600, 440);
      }
    }

    async function loadAccountHistory() {
      try {
        const bridge = await getBridge();
        if (!bridge) return;
        const jsonStr = await bridge.GetSavedAccounts();
        savedAccountsCache = JSON.parse(jsonStr || '[]');
        
        document.getElementById('historyCount').innerText = savedAccountsCache.length;
        renderAccountsList();
      } catch (e) {}
    }

    function renderAccountsList() {
      const container = document.getElementById('accountsList');
      if (!savedAccountsCache || savedAccountsCache.length === 0) {
        container.innerHTML = '<div class="empty-history">У вас пока нет сохраненных аккаунтов.<br>Войдите в любой аккаунт, и он автоматически появится здесь для быстрого входа!</div>';
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      let html = '';

      savedAccountsCache.forEach((acc, index) => {
        // 3-hour warranty calculation (10800s from AddedAt)
        const added = acc.AddedAt || now;
        const warrantyEnd = added + (3 * 3600);
        const warrantySecondsLeft = Math.max(0, warrantyEnd - now);

        let warrantyBadge = '';
        let isWarrantyActive = false;

        if (warrantySecondsLeft > 0) {
          isWarrantyActive = true;
          const hrs = Math.floor(warrantySecondsLeft / 3600);
          const mins = Math.floor((warrantySecondsLeft % 3600) / 60);
          warrantyBadge = '<span class="warranty-badge warranty-active">🟢 ГАРАНТИЯ: ' + hrs + 'ч ' + mins + 'м</span>';
        } else {
          warrantyBadge = '<span class="warranty-badge warranty-expired">⚪ ГАРАНТИЯ ИСТЕКЛА</span>';
        }

        const safeToken = encodeURIComponent(acc.Token);
        const displayName = acc.AccountName || acc.SteamId || 'Steam Account';

        html += \`
          <div class="acc-card">
            <div class="acc-header">
              <div class="acc-info">
                <span class="acc-name">\${displayName}</span>
                <span class="acc-id">\${acc.SteamId}</span>
              </div>
              \${warrantyBadge}
            </div>
            <div class="acc-actions">
              <button class="btn-acc-login" onclick="loginDirectly('\${safeToken}')">
                <span>⚡</span> ВОЙТИ
              </button>
              <button class="btn-acc-check" onclick="checkAccountDirectly('\${safeToken}', '\${acc.SteamId}')">
                ПРОВЕРИТЬ
              </button>
              \${isWarrantyActive ? \`<button class="btn-acc-claim" onclick="claimWarrantyDirectly('\${safeToken}')">🛡️ ЗАМЕНА</button>\` : ''}
              <button class="btn-acc-del" onclick="deleteAccountDirectly('\${acc.SteamId}')" title="Удалить из истории">✕</button>
            </div>
          </div>
        \`;
      });

      container.innerHTML = html;
    }

    async function loginDirectly(encodedToken) {
      const token = decodeURIComponent(encodedToken);
      document.getElementById('tokenInput').value = token;
      await launchSteam();
    }

    async function checkAccountDirectly(encodedToken, steamId) {
      const token = decodeURIComponent(encodedToken);
      const bridge = await getBridge();
      if (!bridge) return;

      setStatus('loading', 'ПРОВЕРКА АККАУНТА...', 'Проверяем статус токена ' + steamId);
      const resJson = await bridge.CheckToken(token);
      const data = JSON.parse(resJson || '{}');

      if (data.valid && data.secondsRemaining > 0) {
        const days = Math.floor(data.secondsRemaining / 86400);
        const hrs = Math.floor((data.secondsRemaining % 86400) / 3600);
        setStatus('success', 'АККАУНТ АКТИВЕН (ЖИВОЙ)', 'Срок действия сессии: ' + days + ' дн, ' + hrs + ' час.');
      } else {
        setStatus('error', 'СЕССИЯ ИСТЕКЛА', 'Токен сброшен или истек. Если гарантия активна — нажмите кнопку "ЗАМЕНА".');
      }
    }

    function claimWarrantyDirectly(encodedToken) {
      const token = decodeURIComponent(encodedToken);
      openUrl('https://sharpbuy.org/#nfa-warranty?token=' + encodeURIComponent(token));
    }

    async function deleteAccountDirectly(steamId) {
      const bridge = await getBridge();
      if (bridge) bridge.DeleteSavedAccount(steamId);
    }

    async function onTitleMouseDown(e) {
      var target = e.target || e.srcElement;
      while (target && target !== document.body) {
        if (target.className && typeof target.className === 'string' && (
            target.className.indexOf('window-btns') !== -1 || 
            target.className.indexOf('win-btn') !== -1 || 
            target.className.indexOf('history-toggle-btn') !== -1 ||
            target.className.indexOf('link-action') !== -1 ||
            target.className.indexOf('btn-log-steam') !== -1 ||
            target.className.indexOf('btn-acc-login') !== -1 ||
            target.className.indexOf('btn-acc-check') !== -1 ||
            target.className.indexOf('btn-acc-claim') !== -1 ||
            target.className.indexOf('btn-acc-del') !== -1 ||
            target.className.indexOf('tools-panel') !== -1 ||
            target.className.indexOf('tool-item') !== -1 ||
            target.className.indexOf('footer-item') !== -1 ||
            target.className.indexOf('input-box') !== -1)) {
          return;
        }
        target = target.parentNode;
      }
      const bridge = await getBridge();
      if (bridge) bridge.OnDragWindow();
    }

    async function onMinimize(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const bridge = await getBridge();
      if (bridge) bridge.Minimize();
    }

    async function onClose(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const bridge = await getBridge();
      if (bridge) bridge.Close();
    }

    async function pasteToken() {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          var el = document.getElementById('tokenInput');
          if (el) el.value = text.trim();
        }
      } catch (e) {}
    }

    async function changePath() {
      const bridge = await getBridge();
      if (bridge) bridge.ChangePath();
    }

    function updateSteamPathDisplay(newPath) {
      var el = document.getElementById('steamPathDisplay');
      if (el) el.innerText = newPath.replace(/\\\\/g, '/');
    }

    async function launchSteam() {
      var el = document.getElementById('tokenInput');
      var token = el ? el.value.trim() : '';
      if (!token || token.length < 3) {
        setStatus('error', 'TOKEN MISSING', 'Please paste the Steam NFA session token into the field above.');
        return;
      }

      setStatus('loading', 'INJECTING SESSION...', 'Stopping Steam processes, encrypting DPAPI ConnectCache and launching Steam.');
      const bridge = await getBridge();
      if (bridge) bridge.LaunchSteam(token);
    }

    function onLoginSuccess(steamId, accountName, message) {
      setStatus('success', 'LOGGED IN SUCCESSFULLY', message);
      loadAccountHistory();
    }

    async function resetSteam() {
      setStatus('loading', 'RESETTING STEAM...', 'Clearing login session, local.vdf cache and restoring default login dialog.');
      const bridge = await getBridge();
      if (bridge) {
        const ok = await bridge.ResetSteam();
        if (ok) {
          setStatus('success', 'STEAM RESET COMPLETE', 'Steam data cleared. Default login dialog restored.');
        } else {
          setStatus('error', 'RESET FAILED', 'Could not reset Steam files.');
        }
      }
    }

    async function killSteam() {
      const bridge = await getBridge();
      if (bridge) {
        bridge.KillSteam();
        setStatus('success', 'PROCESSES TERMINATED', 'All steam.exe and steamwebhelper.exe processes have been stopped.');
      }
    }

    async function openSteamFolder() {
      const bridge = await getBridge();
      if (bridge) bridge.OpenSteamDir();
    }

    async function openUrl(url) {
      const bridge = await getBridge();
      if (bridge) bridge.OpenBrowser(url);
    }

    function setStatus(type, title, sub) {
      const dot = document.getElementById('statusDot');
      const t = document.getElementById('statusTitle');
      const s = document.getElementById('statusSub');

      if (t) t.innerText = title;
      if (s) s.innerText = sub;

      if (dot) {
        if (type === 'success') {
          dot.style.background = '#22c55e';
          dot.style.boxShadow = '0 0 8px #22c55e';
        } else if (type === 'error') {
          dot.style.background = '#ef4444';
          dot.style.boxShadow = '0 0 8px #ef4444';
        } else if (type === 'loading') {
          dot.style.background = '#f97316';
          dot.style.boxShadow = '0 0 8px #f97316';
        }
      }
    }

    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>
`;

fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\SharpBuy\\src\\launcher\\SharpBuy_Launcher\\Assets\\index.html', fullHtml, 'utf8');
console.log('Successfully generated updated index.html with Account History drawer and 1-Click Login!');
