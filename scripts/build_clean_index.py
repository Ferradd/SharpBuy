import os
import subprocess
import re

bak_path = r"c:\Users\iliyk\Desktop\SharpBuy\src\launcher\SharpBuy_Launcher\Assets\index.html.bak"
out_path = r"c:\Users\iliyk\Desktop\SharpBuy\src\launcher\SharpBuy_Launcher\Assets\index.html"

with open(bak_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Insert CSS right before </style>
css_insert = """
  /* Login Action Buttons Row */
  .login-btn-row {
    display: flex;
    gap: 8px;
    width: 100%;
    flex-shrink: 0;
  }
  .btn-log-steam-main {
    flex: 2;
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
  }
  .btn-log-steam-main:hover {
    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
    transform: translateY(-1px);
  }
  .btn-log-steam-offline {
    flex: 1;
    padding: 12px 10px;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(14, 116, 144, 0.16) 100%);
    border: 1px solid rgba(6, 182, 212, 0.4);
    color: #38bdf8;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-log-steam-offline:hover {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(14, 116, 144, 0.3) 100%);
    border-color: #38bdf8;
    color: #ffffff;
    box-shadow: 0 0 14px rgba(6, 182, 212, 0.3);
    transform: translateY(-1px);
  }

  /* Drawer All Games Hub Button */
  .drawer-btn-all-games {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.16) 0%, rgba(234, 88, 12, 0.16) 100%);
    border: 1px solid rgba(249, 115, 22, 0.4);
    color: #fb923c;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 12px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .drawer-btn-all-games:hover {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(234, 88, 12, 0.3) 100%);
    border-color: #f97316;
    color: #ffffff;
    box-shadow: 0 0 12px rgba(249, 115, 22, 0.25);
    transform: translateY(-1px);
  }
  .drawer-btn-all-games .all-games-badge {
    background: #f97316;
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    border-radius: 10px;
    padding: 1px 7px;
  }

  /* Stealth & VAC & Inventory Badges */
  .owner-active-badge {
    background: rgba(239, 68, 68, 0.25);
    border: 1px solid #ef4444;
    color: #fca5a5;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.4px;
    animation: ownerPulse 1.2s infinite ease-in-out;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  @keyframes ownerPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.75; transform: scale(0.97); }
  }
  .vac-badge-clean {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #4ade80;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 4px;
  }
  .vac-badge-warn {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #f87171;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 4px;
  }
  .items-badge {
    background: rgba(148, 163, 184, 0.12);
    border: 1px solid rgba(148, 163, 184, 0.25);
    color: #cbd5e1;
    font-size: 9px;
    font-weight: 600;
    padding: 2px 5px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
  }
  .btn-acc-offline-sm {
    background: rgba(6, 182, 212, 0.12);
    border: 1px solid rgba(6, 182, 212, 0.35);
    color: #38bdf8;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    padding: 5px 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    transition: all 0.15s;
  }
  .btn-acc-offline-sm:hover {
    background: rgba(6, 182, 212, 0.25);
    border-color: #38bdf8;
    color: #ffffff;
  }

  /* Emergency Owner Alert Modal */
  .owner-alert-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    z-index: 10000;
    align-items: center;
    justify-content: center;
  }
  .owner-alert-overlay.active {
    display: flex;
  }
  .owner-alert-dialog {
    background: #0f131a;
    border: 2px solid #ef4444;
    border-radius: 12px;
    width: 420px;
    max-width: 90%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
    animation: alertBounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes alertBounce {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
  }
  .owner-alert-icon {
    font-size: 36px;
    line-height: 1;
  }
  .owner-alert-title {
    font-size: 16px;
    font-weight: 800;
    color: #ef4444;
    letter-spacing: 0.5px;
  }
  .owner-alert-desc {
    font-size: 11px;
    color: #cbd5e1;
    line-height: 1.5;
    background: #181d27;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 10px 12px;
  }
  .btn-dismiss-alert {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border: none;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: all 0.15s;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  .btn-dismiss-alert:hover {
    background: #f87171;
    transform: translateY(-1px);
  }

  /* All Games Hub View */
  .all-games-view {
    display: none;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-height: 0;
    justify-content: flex-start;
    animation: allGamesFadeIn 0.25s ease-out;
  }
  @keyframes allGamesFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .all-games-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .all-games-top-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-rescan-games {
    background: rgba(249, 115, 22, 0.12);
    border: 1px solid rgba(249, 115, 22, 0.35);
    border-radius: 5px;
    padding: 5px 10px;
    color: #fb923c;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s;
  }
  .btn-rescan-games:hover {
    background: rgba(249, 115, 22, 0.25);
    border-color: #f97316;
    color: #ffffff;
  }
  .btn-rescan-games:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .all-games-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #090b0e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    flex-shrink: 0;
    gap: 10px;
  }
  .all-games-header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }
  .all-games-title {
    font-size: 13px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .all-games-subtitle {
    font-size: 10px;
    color: #64748b;
  }
  .all-games-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .all-games-stat-pill {
    background: #161b24;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 48px;
  }
  .all-games-stat-pill .stat-num {
    font-size: 12px;
    font-weight: 800;
    color: #f97316;
  }
  .all-games-stat-pill .stat-lbl {
    font-size: 8px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.5px;
  }
  .scan-progress-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 10px;
    background: #090b0e;
    border: 1px solid rgba(249, 115, 22, 0.3);
    border-radius: 6px;
    flex-shrink: 0;
  }
  .scan-progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
  }
  .scan-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f97316, #22c55e);
    transition: width 0.2s ease;
  }
  .scan-progress-text {
    font-size: 10px;
    color: #cbd5e1;
    font-family: 'JetBrains Mono', monospace;
  }
  .all-games-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;
  }
  .all-games-search-box {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }
  .all-games-search-box svg {
    position: absolute;
    left: 10px;
    pointer-events: none;
  }
  .all-games-search-input {
    width: 100%;
    height: 32px;
    background: #090b0e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0 28px 0 28px;
    color: #ffffff;
    font-size: 11px;
    outline: none;
    transition: border-color 0.15s;
  }
  .all-games-search-input:focus {
    border-color: #f97316;
  }
  .all-games-search-clear {
    position: absolute;
    right: 8px;
    cursor: pointer;
    color: #64748b;
    font-size: 14px;
    line-height: 1;
  }
  .all-games-search-clear:hover {
    color: #ffffff;
  }
  .all-games-sort-select {
    height: 32px;
    background: #090b0e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0 8px;
    color: #cbd5e1;
    font-size: 10px;
    font-weight: 600;
    outline: none;
    cursor: pointer;
  }
  .all-games-grid-wrap {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    background: #090b0e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 8px;
  }
  .all-games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }
  .hub-game-card {
    background: #141922;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 7px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    transition: all 0.15s ease;
  }
  .hub-game-card:hover {
    border-color: #f97316;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(249, 115, 22, 0.25);
  }
  .hub-game-thumb-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 460 / 215;
    background: #090b0e;
    overflow: hidden;
  }
  .hub-game-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .hub-game-acc-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(9, 11, 14, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fb923c;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .hub-game-details {
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    justify-content: space-between;
  }
  .hub-game-name {
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hub-game-meta {
    font-size: 9px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .hub-state-msg {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 10px;
    color: #64748b;
    font-size: 11px;
  }

  /* Game Accounts Modal */
  .game-accounts-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(3px);
    z-index: 9999;
    align-items: center;
    justify-content: center;
  }
  .game-accounts-overlay.active {
    display: flex;
  }
  .game-accounts-dialog {
    background: #0d1015;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    width: 380px;
    max-width: 90%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
    animation: modalScaleIn 0.2s ease-out;
  }
  @keyframes modalScaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .game-dialog-header {
    position: relative;
    padding: 12px;
    background: #090b0e;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .game-dialog-banner-wrap {
    width: 90px;
    height: 42px;
    border-radius: 4px;
    overflow: hidden;
    background: #161b24;
    flex-shrink: 0;
  }
  .game-dialog-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .game-dialog-info {
    flex: 1;
    overflow: hidden;
  }
  .game-dialog-title {
    font-size: 13px;
    font-weight: 800;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .game-dialog-meta {
    font-size: 10px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }
  .game-dialog-close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 18px;
    cursor: pointer;
    line-height: 1;
  }
  .game-dialog-close:hover {
    color: #ffffff;
  }
  .game-dialog-accounts-label {
    padding: 8px 12px;
    font-size: 9px;
    font-weight: 800;
    color: #64748b;
    letter-spacing: 0.5px;
    background: #11141a;
  }
  .game-dialog-accounts-list {
    padding: 8px 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 240px;
  }
  .game-acc-item {
    background: #161b24;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    transition: border-color 0.15s;
  }
  .game-acc-item:hover {
    border-color: rgba(249, 115, 22, 0.4);
    background: #1b212c;
  }
  .game-acc-left {
    display: flex;
    align-items: center;
    gap: 9px;
    overflow: hidden;
    flex: 1;
  }
  .game-acc-avatar {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid rgba(249, 115, 22, 0.4);
    object-fit: cover;
    flex-shrink: 0;
  }
  .game-acc-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow: hidden;
  }
  .game-acc-name {
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .game-acc-sub {
    font-size: 9px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }
  .btn-game-acc-login {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border: none;
    border-radius: 6px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.4px;
    padding: 7px 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
    transition: all 0.15s;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  }
  .btn-game-acc-login:hover {
    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.45);
    transform: translateY(-1px);
  }
"""

content = content.replace("</style>", css_insert + "\n</style>", 1)

# 2. Replace Single Login Button with Row
old_login_btn = '''      <!-- Main Login Button -->
      <button class="btn-log-steam" onclick="launchSteam()">
        LOG INTO STEAM ACCOUNT  
      </button>'''

new_login_btn = '''      <!-- Main Login Buttons (Stealth + Offline) -->
      <div class="login-btn-row">
        <button class="btn-log-steam-main" onclick="launchSteam()" title="Auto-detect, disable RemotePlay, set Invisible Friends & protect session">
          <svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          LOGIN TO STEAM
        </button>
        <button class="btn-log-steam-offline" onclick="launchSteamOffline()" title="1-Click Offline Mode for single-player games. Steam server never sees your session!">
          <svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          OFFLINE PLAY
        </button>
      </div>'''

content = content.replace(old_login_btn, new_login_btn, 1)

# 3. Add allGamesView inside main-panel
old_passport_end = '''        <div class="passport-actions-row">
            <button class="btn-acc-check" id="passportCheckBtn" onclick="passportCheck()">CHECK SESSION</button>
          </div>
        </div>
      </div>
    </div>'''

all_games_view_html = '''        <div class="passport-actions-row">
            <button class="btn-acc-check" id="passportCheckBtn" onclick="passportCheck()">CHECK SESSION</button>
          </div>
        </div>
      </div>

      <!-- All Accounts Game Hub View -->
      <div id="allGamesView" class="panel-view all-games-view">
        <div class="all-games-top-bar">
          <div class="passport-back" onclick="closeAllGamesView()">
            <svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            BACK TO LOGIN
          </div>
          <div class="all-games-top-actions">
            <button class="btn-rescan-games" id="btnRescanAllGames" onclick="scanAllAccountsGames(true)">
              <svg class="ui-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>RE-SCAN ALL</span>
            </button>
          </div>
        </div>

        <div class="all-games-header">
          <div class="all-games-header-left">
            <div class="all-games-title">
              <svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/></svg>
              <span>ALL ACCOUNTS GAME HUB</span>
            </div>
            <div class="all-games-subtitle" id="allGamesSubtitle">All paid games aggregated across your saved accounts</div>
          </div>
          <div class="all-games-stats">
            <div class="all-games-stat-pill">
              <span class="stat-num" id="statUniqueGames">0</span>
              <span class="stat-lbl">GAMES</span>
            </div>
            <div class="all-games-stat-pill">
              <span class="stat-num" id="statScannedAccounts">0</span>
              <span class="stat-lbl">ACCS</span>
            </div>
            <div class="all-games-stat-pill">
              <span class="stat-num" id="statTotalHours">0h</span>
              <span class="stat-lbl">HOURS</span>
            </div>
          </div>
        </div>

        <div class="scan-progress-container" id="scanProgressContainer" style="display:none;">
          <div class="scan-progress-bar">
            <div class="scan-progress-fill" id="scanProgressFill" style="width: 0%;"></div>
          </div>
          <div class="scan-progress-text" id="scanProgressText">Scanning accounts: 0/0...</div>
        </div>

        <div class="all-games-controls">
          <div class="all-games-search-box">
            <svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="allGamesSearchInput" class="all-games-search-input" placeholder="Search any game (GTA, Rust, Cyberpunk, RDR2...)" oninput="filterAllGames(this.value)" />
            <span class="all-games-search-clear" onclick="clearAllGamesSearch()" id="allGamesClearBtn" style="display:none;">&times;</span>
          </div>
          <select id="allGamesSortSelect" class="all-games-sort-select" onchange="applyAllGamesSort()">
            <option value="accounts">👥 Most Accounts</option>
            <option value="hours">⏳ Playtime (Hours)</option>
            <option value="alpha">🔤 Alphabetical</option>
          </select>
        </div>

        <div class="all-games-grid-wrap" id="allGamesGridWrap">
          <div class="all-games-grid" id="allGamesGrid">
            <div class="hub-state-msg">Open History or click RE-SCAN ALL to aggregate games across your accounts.</div>
          </div>
        </div>
      </div>
    </div>'''

content = content.replace(old_passport_end, all_games_view_html, 1)

# 4. Add drawer button in .drawer-toolbar
old_toolbar = '<div class="drawer-toolbar">\n        <button class="drawer-btn drawer-btn-import"'
new_toolbar = '''<div class="drawer-toolbar">
        <button class="drawer-btn drawer-btn-all-games" onclick="openAllGamesLibrary()">
          <svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/></svg>
          <span>ALL GAMES LIBRARY</span>
          <span class="all-games-badge" id="drawerAllGamesBadge">0</span>
        </button>
        <button class="drawer-btn drawer-btn-import"'''

content = content.replace(old_toolbar, new_toolbar, 1)

# 5. Add Emergency Alert Modal & Game Accounts Modal
old_modal_anchor = '    </div>\n  </div>\n\n  <script>'
new_modal_anchor = '''    </div>
  </div>

  <!-- Emergency Owner Alert Modal -->
  <div class="owner-alert-overlay" id="ownerAlertOverlay">
    <div class="owner-alert-dialog">
      <div class="owner-alert-icon">🚨</div>
      <div class="owner-alert-title">ВЛАДЕЛЕЦ В СЕТИ!</div>
      <div class="owner-alert-desc" id="ownerAlertDesc">Владелец зашел в Steam или запустил игру на своем ПК. Игра и Steam были экстренно закрыты лаунчером для 100% защиты от обнаружения (конфликт сессий предотвращен).</div>
      <button class="btn-dismiss-alert" onclick="dismissOwnerAlert()">ПОНЯЛ (ЗАКРЫТЬ)</button>
    </div>
  </div>

  <!-- Game Accounts Selection Modal -->
  <div class="game-accounts-overlay" id="gameAccountsModal" onclick="if(event.target===this) closeGameAccountsModal()">
    <div class="game-accounts-dialog">
      <div class="game-dialog-header">
        <div class="game-dialog-banner-wrap">
          <img id="gameDialogImg" class="game-dialog-img" src="" alt="" onerror="handleGameIconError(this)" />
        </div>
        <div class="game-dialog-info">
          <div class="game-dialog-title" id="gameDialogTitle">—</div>
          <div class="game-dialog-meta" id="gameDialogMeta">—</div>
        </div>
        <button class="game-dialog-close" onclick="closeGameAccountsModal()">&times;</button>
      </div>
      
      <div class="game-dialog-accounts-label">
        <span>AVAILABLE ON THE FOLLOWING ACCOUNTS (CLICK TO PLAY):</span>
      </div>

      <div class="game-dialog-accounts-list" id="gameDialogAccountsList">
        <!-- Rendered dynamically -->
      </div>
    </div>
  </div>

  <script>'''

content = content.replace(old_modal_anchor, new_modal_anchor, 1)

# 6. JavaScript Logic
script_start = content.find("<script>")
script_end = content.rfind("</script>") + len("</script>")

js_code = r"""<script>
    let isDrawerOpen = false;
    let savedAccountsCache = [];
    let passportAccount = null;
    let passportLoadToken = 0;
    let passportPaidGames = [];
    let isPassportOpen = false;
    let warrantyTicker = null;
    let historyLoadInProgress = false;
    let lastAccountsRenderKey = '';

    // All Games Hub State
    let isAllGamesOpen = false;
    let cachedGamesDb = {};
    let allAggregatedGames = [];
    let allGamesSearchQuery = '';
    let allGamesSortMode = 'accounts';
    let isScanningAllGames = false;
    let selectedGameForModal = null;

    const WINDOW_SIZES = {
      WIDTH_NORMAL: 600,
      WIDTH_DRAWER: 980,
      HEIGHT_NORMAL: 440,
      HEIGHT_PASSPORT: 560
    };

    const SVG_ZAP = '<svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    const SVG_SHIELD = '<svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    const SVG_X = '<svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    
    function trashIcon(size, stroke) {
      return '<svg class="ui-icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    }

    const SVG_TRASH = trashIcon(12, 'currentColor');
    const SVG_CHEVRON = '<svg class="ui-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

    function badgeDot(type) {
      return '<span class="badge-dot badge-dot-' + type + '"></span>';
    }

    function warrantyBadgeHtml(type, text) {
      const dot = type === 'active' ? 'green' : (type === 'dead' ? 'red' : 'gray');
      const cls = type === 'active' ? 'warranty-active' : (type === 'dead' ? 'warranty-dead' : 'warranty-expired');
      return '<span class="warranty-badge ' + cls + '">' + badgeDot(dot) + text + '</span>';
    }

    function getTargetWindowSize(passportMode) {
      const isTall = isPassportOpen || isAllGamesOpen || passportMode;
      return {
        w: isDrawerOpen ? WINDOW_SIZES.WIDTH_DRAWER : WINDOW_SIZES.WIDTH_NORMAL,
        h: isTall ? WINDOW_SIZES.HEIGHT_PASSPORT : WINDOW_SIZES.HEIGHT_NORMAL
      };
    }

    async function applyWindowSize(passportMode, animated) {
      const bridge = await getBridge();
      if (!bridge) return;
      const size = getTargetWindowSize(passportMode);

      if (animated && bridge.SetWindowSizeAnimated) {
        try {
          await bridge.SetWindowSizeAnimated(size.w, size.h, 320);
        } catch (e) {}
      }

      await Promise.resolve(bridge.SetWindowSize(size.w, size.h));
      if (animated || document.documentElement.classList.contains('platform-tauri')) {
        await new Promise(function(r) { setTimeout(r, 40); });
        await Promise.resolve(bridge.SetWindowSize(size.w, size.h));
      }
    }

    function forceLayout(el) {
      if (!el) return;
      void el.offsetHeight;
    }

    async function getBridge() {
      if (window.chrome && window.chrome.webview && window.chrome.webview.hostObjects) {
        return window.chrome.webview.hostObjects.bridge;
      }
      if (window.sharpBuyBridge) {
        return window.sharpBuyBridge;
      }
      return null;
    }

    function installTrashIcons() {
      const clearSteamTrash = document.getElementById('clearSteamTrashIcon');
      if (clearSteamTrash) clearSteamTrash.innerHTML = trashIcon(18, '#ef4444');
      const clearAllTrash = document.getElementById('clearAllTrashIcon');
      if (clearAllTrash) clearAllTrash.innerHTML = trashIcon(12, 'currentColor');
    }

    async function init() {
      installTrashIcons();
      if (window.sharpBuyBridge && !window.__TAURI__) {
        document.body.classList.add('platform-mac', 'platform-electron');
      }
      if (window.__TAURI__) {
        document.body.classList.add('platform-mac', 'platform-tauri');
      }
      try {
        const bridge = await getBridge();
        if (bridge) {
          const path = await bridge.GetSteamPath();
          if (path) updateSteamPathDisplay(path);
          await loadAccountHistory();
          await loadCachedGamesDb();
          await applyWindowSize(false, false);
        }
      } catch (e) {}
    }

    async function toggleHistoryDrawer() {
      isDrawerOpen = !isDrawerOpen;
      const drawer = document.getElementById('historyDrawer');
      const bridge = await getBridge();

      if (isDrawerOpen) {
        drawer.classList.add('active');
        forceLayout(drawer);
        startWarrantyTicker();
        await loadAccountHistory(true);
        await new Promise(function(r) { requestAnimationFrame(function() { requestAnimationFrame(r); }); });
        await applyWindowSize(isPassportOpen || isAllGamesOpen, true);
        if (bridge) {
          bridge.RefreshAllProfilesAsync();
          bridge.RefreshAllWarrantiesAsync();
        }
      } else {
        drawer.classList.remove('active');
        stopWarrantyTicker();
        await applyWindowSize(isPassportOpen || isAllGamesOpen, true);
      }
    }

    function getAccountsRenderKey() {
      if (!savedAccountsCache || savedAccountsCache.length === 0) return '';
      return savedAccountsCache.map(function(a) {
        return [a.SteamId, a.PersonaName, a.AvatarUrl, a.IsAlive, a.AccountName, a.VacBanned, a.VacStatus, a.Cs2ItemsCount, a.DotaItemsCount, a.OwnerActive, a.LastCheckedAt, a.ExpSeconds, a.StatusMessage].join('|');
      }).join('||');
    }

    async function loadAccountHistory(forceRender) {
      if (historyLoadInProgress) return;
      historyLoadInProgress = true;
      try {
        const bridge = await getBridge();
        if (!bridge) return;
        const jsonStr = await bridge.GetSavedAccounts();
        savedAccountsCache = JSON.parse(jsonStr || '[]');
        document.getElementById('historyCount').innerText = savedAccountsCache.length;
        renderAccountsList(forceRender === true);
        aggregateGamesFromCache();
      } catch (e) {}
      finally {
        historyLoadInProgress = false;
      }
    }

    function renderAccountsList(force) {
      const container = document.getElementById('accountsList');
      const renderKey = getAccountsRenderKey();
      if (!force && renderKey === lastAccountsRenderKey && container.querySelector('.acc-card')) {
        updateWarrantyBadges();
        return;
      }
      lastAccountsRenderKey = renderKey;

      if (!savedAccountsCache || savedAccountsCache.length === 0) {
        container.innerHTML = '<div class="empty-history">No saved accounts yet.<br>Log in to any account and it will appear here automatically with a real avatar for one-click login!</div>';
        return;
      }

      let html = '';
      savedAccountsCache.forEach(function(acc, index) {
        const meta = buildWarrantyBadge(acc);
        const warrantyBadge = meta.warrantyBadge;
        const isWarrantyActive = meta.isWarrantyActive;

        const safeToken = encodeURIComponent(acc.Token);
        const displayName = acc.PersonaName && acc.PersonaName !== acc.SteamId 
          ? acc.PersonaName 
          : (acc.AccountName || acc.SteamId);

        const avatarSrc = acc.AvatarUrl || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg';
        const isDeadClass = acc.IsAlive === false ? 'dead-session' : '';

        let ownerBadge = '';
        if (acc.OwnerActive) {
          ownerBadge = '<span class="owner-active-badge">🚨 ВЛАДЕЛЕЦ В СЕТИ</span>';
        }

        let vacBadge = '';
        if (acc.VacStatus === 'VAC BANNED') {
          vacBadge = '<span class="vac-badge-warn">🚫 VAC БАН</span>';
        } else if (acc.VacStatus === 'TRADE BANNED') {
          vacBadge = '<span class="vac-badge-warn">🚫 ТРЕЙД БАН</span>';
        } else if (acc.VacStatus === 'LIMITED $5') {
          vacBadge = '<span class="vac-badge-warn">⚠️ ЛИМИТ $5</span>';
        } else {
          vacBadge = '<span class="vac-badge-clean" title="VAC: Чисто">🛡️</span>';
        }

        let itemsBadge = '';
        if (acc.Cs2ItemsCount > 0) {
          itemsBadge += '<span class="items-badge">🎒 CS2: ' + acc.Cs2ItemsCount + ' предм.</span>';
        }
        if (acc.DotaItemsCount > 0) {
          itemsBadge += '<span class="items-badge">🛡️ Dota: ' + acc.DotaItemsCount + ' предм.</span>';
        }

        html += `
          <div class="acc-card ${isDeadClass}" id="card-${acc.SteamId}">
            <div class="acc-header acc-header-clickable" onclick="openAccountPassport('${acc.SteamId}')" title="Open account passport">
              <img src="${avatarSrc}" class="acc-avatar" alt="Avatar" onerror="this.src='https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg'" />
              <div class="acc-info">
                <span class="acc-name">${displayName}</span>
                <span class="acc-id">${acc.SteamId}</span>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;flex-wrap:wrap;">
                  ${ownerBadge}
                  ${vacBadge}
                  ${itemsBadge}
                  <span class="acc-open-hint">Games ${SVG_CHEVRON}</span>
                </div>
              </div>
              <div id="badge-${acc.SteamId}">${warrantyBadge}</div>
            </div>
            <div class="acc-actions" onclick="event.stopPropagation()">
              <button class="btn-acc-login" onclick="loginDirectly('${safeToken}')" title="Stealth Guard Login">
                ${SVG_ZAP} LOGIN
              </button>
              <button class="btn-acc-offline-sm" onclick="loginDirectlyOffline('${safeToken}')" title="1-Click Offline Mode">
                🛡️ OFFLINE
              </button>
              <button class="btn-acc-check" id="btn-chk-${acc.SteamId}" onclick="checkAccountDirectly('${safeToken}', '${acc.SteamId}')">
                CHECK
              </button>
              <button class="btn-acc-claim" id="btn-claim-${acc.SteamId}" style="${(isWarrantyActive || acc.IsAlive === false) ? '' : 'display:none;'}" onclick="claimWarrantyDirectly('${safeToken}')">${SVG_SHIELD} REPLACE</button>
              <button class="btn-acc-del" onclick="deleteAccountDirectly('${acc.SteamId}')" title="Remove from history">${SVG_TRASH}</button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;

      if (passportAccount) {
        const sel = document.getElementById('card-' + passportAccount.SteamId);
        if (sel) sel.classList.add('selected');
      }
    }

    async function openAccountPassport(steamId) {
      const acc = savedAccountsCache.find(function(a) { return a.SteamId === steamId; });
      if (!acc) return;

      isPassportOpen = true;
      if (isAllGamesOpen) {
        isAllGamesOpen = false;
        document.getElementById('allGamesView').style.display = 'none';
      }

      if (!isDrawerOpen) {
        isDrawerOpen = true;
        const drawerEl = document.getElementById('historyDrawer');
        drawerEl.classList.add('active');
        forceLayout(drawerEl);
        const bridge = await getBridge();
        if (bridge) bridge.RefreshAllProfilesAsync();
        await loadAccountHistory(true);
        await new Promise(function(r) { requestAnimationFrame(function() { requestAnimationFrame(r); }); });
        await applyWindowSize(false, true);
      }

      passportAccount = acc;
      document.querySelectorAll('.acc-card.selected').forEach(function(el) { el.classList.remove('selected'); });
      const card = document.getElementById('card-' + steamId);
      if (card) card.classList.add('selected');

      document.getElementById('loginView').style.display = 'none';
      const passportEl = document.getElementById('passportView');
      passportEl.style.display = 'flex';
      passportEl.style.animation = 'none';
      void passportEl.offsetHeight;
      passportEl.style.animation = '';

      await applyWindowSize(true, true);

      const displayName = acc.PersonaName && acc.PersonaName !== acc.SteamId
        ? acc.PersonaName
        : (acc.AccountName || acc.SteamId);

      document.getElementById('passportAvatar').src = acc.AvatarUrl || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg';
      document.getElementById('passportName').innerText = displayName;
      document.getElementById('passportSteamId').innerText = acc.SteamId;
      document.getElementById('passportGameCount').innerText = '...';
      document.getElementById('passportCs2Hours').innerText = '...';
      document.getElementById('passportTokenDays').innerText = acc.ExpSeconds
        ? Math.max(0, Math.floor(acc.ExpSeconds / 86400))
        : '—';
      document.getElementById('passportGamesGrid').innerHTML = '<div class="passport-loading">Loading games and icons...</div>';
      document.getElementById('passportGamesSub').innerText = '';
      document.getElementById('passportSearchCount').innerText = '';
      document.getElementById('passportGameSearch').value = '';
      document.getElementById('passportNote').style.display = 'none';
      passportPaidGames = [];

      const loadId = ++passportLoadToken;
      const bridge = await getBridge();
      if (!bridge) return;

      try {
        const resJson = await bridge.GetAccountLibraryAsync(acc.Token);
        if (loadId !== passportLoadToken) return;

        const data = JSON.parse(resJson || '{}');

        if (!data.success) {
          document.getElementById('passportGameCount').innerText = '0';
          document.getElementById('passportCs2Hours').innerText = '0';
          document.getElementById('passportGamesGrid').innerHTML = '<div class="passport-loading">' + escapeHtml(data.error || 'Failed to load games') + '</div>';
          return;
        }

        passportPaidGames = data.games || [];
        document.getElementById('passportGameCount').innerText = data.paidGameCount != null ? data.paidGameCount : passportPaidGames.length;
        document.getElementById('passportCs2Hours').innerText = data.cs2Hours != null ? data.cs2Hours : '0';

        if (data.totalGameCount != null) {
          document.getElementById('passportGamesSub').innerText = data.totalGameCount + ' total · free hidden';
        }

        renderPassportGameGrid(passportPaidGames);

        cachedGamesDb[acc.SteamId] = {
          token: acc.Token,
          timestamp: Date.now(),
          games: data.games || [],
          paidGameCount: data.paidGameCount || (data.games ? data.games.length : 0),
          totalGameCount: data.totalGameCount || 0
        };
        saveCachedGamesDb();
        aggregateGamesFromCache();

        if (data.partial && data.note) {
          const noteEl = document.getElementById('passportNote');
          noteEl.innerText = data.note;
          noteEl.style.display = 'block';
        }
      } catch (e) {
        if (loadId !== passportLoadToken) return;
        document.getElementById('passportGamesGrid').innerHTML = '<div class="passport-loading">Error: ' + escapeHtml(e.message || 'unknown') + '</div>';
      }
    }

    function formatGameHours(hours) {
      if (!hours || hours <= 0) return '0 h';
      if (hours < 1) return '<1 h';
      return hours + ' h';
    }

    function gameIconFallbackList(g) {
      const list = [];
      if (g.iconUrl) list.push(g.iconUrl);
      if (g.iconFallbacks && g.iconFallbacks.length) {
        g.iconFallbacks.forEach(function(u) { if (u) list.push(u); });
      }
      list.push(
        'https://cdn.cloudflare.steamstatic.com/steam/apps/' + g.appid + '/logo.png',
        'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/' + g.appid + '/logo.png'
      );
      var seen = {};
      return list.filter(function(u) {
        if (!u || seen[u]) return false;
        if (u.indexOf('header.jpg') !== -1 || u.indexOf('library_600x900') !== -1 || u.indexOf('capsule_') !== -1) return false;
        seen[u] = true;
        return true;
      });
    }

    function handleGameIconError(img) {
      var list = (img.dataset.fallbacks || '').split('|').filter(Boolean);
      var idx = parseInt(img.dataset.fallbackIdx || '0', 10) + 1;
      if (idx < list.length) {
        img.dataset.fallbackIdx = String(idx);
        img.src = list[idx];
      } else {
        img.onerror = null;
        img.style.opacity = '0.3';
      }
    }

    function renderPassportGameGrid(games) {
      const grid = document.getElementById('passportGamesGrid');
      const countEl = document.getElementById('passportSearchCount');

      if (!games || games.length === 0) {
        grid.innerHTML = '<div class="passport-loading">No paid games found<br><span style="font-size:9px;color:#475569">Free / F2P hidden</span></div>';
        if (countEl) countEl.innerText = '0 games';
        return;
      }

      let html = '';
      games.forEach(function(g) {
        const icons = gameIconFallbackList(g);
        const hrs = formatGameHours(g.hours);
        const fallbackData = icons.slice(1).join('|').replace(/"/g, '');
        html += '<div class="passport-game-tile" title="' + escapeHtml(g.name) + '">' +
          '<img src="' + icons[0] + '" alt="" loading="lazy" data-fallbacks="' + fallbackData + '" data-fallback-idx="0" onerror="handleGameIconError(this)" />' +
          '<div class="passport-game-tooltip"><span>' + hrs + '</span></div>' +
          '</div>';
      });

      grid.innerHTML = html;
      if (countEl) {
        const total = passportPaidGames.length;
        countEl.innerText = games.length === total
          ? games.length + ' games'
          : games.length + ' / ' + total;
      }
    }

    function filterPassportGames(query) {
      const q = (query || '').trim().toLowerCase();
      if (!q) {
        renderPassportGameGrid(passportPaidGames);
        return;
      }
      const filtered = passportPaidGames.filter(function(g) {
        return (g.name || '').toLowerCase().indexOf(q) !== -1;
      });
      renderPassportGameGrid(filtered);
    }

    function escapeHtml(str) {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    async function closePassportView() {
      passportLoadToken++;
      passportAccount = null;
      isPassportOpen = false;
      document.getElementById('passportView').style.display = 'none';
      document.getElementById('loginView').style.display = 'flex';
      document.querySelectorAll('.acc-card.selected').forEach(function(el) { el.classList.remove('selected'); });
      await applyWindowSize(false, true);
    }

    async function passportLogin() {
      if (!passportAccount) return;
      document.getElementById('tokenInput').value = passportAccount.Token;
      await launchSteam();
    }

    async function passportCheck() {
      if (!passportAccount) return;
      await checkAccountDirectly(encodeURIComponent(passportAccount.Token), passportAccount.SteamId);
    }

    async function loginDirectly(encodedToken) {
      const token = decodeURIComponent(encodedToken);
      document.getElementById('tokenInput').value = token;
      await launchSteam();
    }

    async function loginDirectlyOffline(encodedToken) {
      const token = decodeURIComponent(encodedToken);
      document.getElementById('tokenInput').value = token;
      await launchSteamOffline();
    }

    async function checkAllAccounts() {
      if (!savedAccountsCache || savedAccountsCache.length === 0) {
        setStatus('error', 'NO ACCOUNTS', 'Import or log in to accounts first, then use CHECK ALL.');
        return;
      }

      const btn = document.getElementById('checkAllBtn');
      if (btn) { btn.disabled = true; btn.innerText = 'CHECKING...'; }

      setStatus('loading', 'CHECKING ALL ACCOUNTS...', 'Verifying ' + savedAccountsCache.length + ' saved account(s)...');

      for (let i = 0; i < savedAccountsCache.length; i++) {
        const acc = savedAccountsCache[i];
        if (!acc || !acc.Token) continue;
        setStatus('loading', 'CHECKING ALL...', 'Account ' + (i + 1) + ' / ' + savedAccountsCache.length + ' — ' + (acc.PersonaName || acc.SteamId));
        await checkAccountDirectly(encodeURIComponent(acc.Token), acc.SteamId);
        await new Promise(function(r) { setTimeout(r, 250); });
      }

      lastAccountsRenderKey = '';
      renderAccountsList(true);
      setStatus('success', 'ALL CHECKS COMPLETE', 'Finished checking ' + savedAccountsCache.length + ' account(s) in history.');

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> CHECK ALL';
      }
    }

    async function checkAccountDirectly(encodedToken, steamId) {
      const token = decodeURIComponent(encodedToken);
      const bridge = await getBridge();
      if (!bridge) return;

      const chkBtn = document.getElementById('btn-chk-' + steamId);
      if (chkBtn) chkBtn.innerText = '⌛...';

      setStatus('loading', 'CHECKING ACCOUNT...', 'Checking token & VAC status for ' + steamId + '...');
      const resJson = await bridge.CheckAccountLiveAsync(token, steamId);
      const data = JSON.parse(resJson || '{}');

      // Deep details (VAC & inventory items)
      try {
        if (bridge.FetchAccountDeepDetailsAsync) {
          const deepResJson = await bridge.FetchAccountDeepDetailsAsync(token, steamId);
          const deepData = JSON.parse(deepResJson || '{}');
          if (deepData && deepData.success) {
            const accObj = savedAccountsCache.find(function(a) { return a.SteamId === steamId; });
            if (accObj) {
              accObj.VacStatus = deepData.vacStatus || accObj.VacStatus;
              accObj.Cs2ItemsCount = deepData.cs2Count || accObj.Cs2ItemsCount;
              accObj.DotaItemsCount = deepData.dotaCount || accObj.DotaItemsCount;
              if (deepData.persona && deepData.persona !== steamId) accObj.PersonaName = deepData.persona;
              if (deepData.avatar) accObj.AvatarUrl = deepData.avatar;
            }
          }
        }
      } catch (e) {}

      if (chkBtn) chkBtn.innerText = 'CHECK';

      const acc = savedAccountsCache.find(function(a) { return a.SteamId === steamId; });
      if (acc) {
        acc.IsAlive = !!data.isAlive;
        acc.ExpSeconds = data.secondsRemaining || acc.ExpSeconds || 0;
        acc.StatusMessage = data.reason || acc.StatusMessage || '';
        acc.LastCheckedAt = Math.floor(Date.now() / 1000);
      }

      const card = document.getElementById('card-' + steamId);
      const badgeContainer = document.getElementById('badge-' + steamId);
      const claimBtn = document.getElementById('btn-claim-' + steamId);

      if (data.isAlive && data.secondsRemaining > 0) {
        const days = Math.floor(data.secondsRemaining / 86400);
        const hrs = Math.floor((data.secondsRemaining % 86400) / 3600);
        const statusTitle = data.checkUnavailable
          ? 'TOKEN VALID'
          : 'ACCOUNT ACTIVE (ALIVE)';
        const statusDetail = data.checkUnavailable
          ? (data.reason || 'JWT is still valid. Steam login should work.')
          : ('Session expires in: ' + days + ' days, ' + hrs + ' hours.');
        setStatus('success', statusTitle, statusDetail);
        if (card) card.classList.remove('dead-session');
      } else if (data.checkUnavailable) {
        setStatus('success', 'TOKEN VALID', data.reason || 'Online check unavailable, but the token has not expired.');
        if (card) card.classList.remove('dead-session');
      } else {
        setStatus('error', 'SESSION REVOKED BY OWNER', 'Login impossible: ' + (data.reason || 'Session revoked') + '. Click "REPLACE" for auto-replacement!');
        if (card) card.classList.add('dead-session');
        if (claimBtn) claimBtn.style.display = 'inline-block';
      }

      if (acc) {
        const meta = buildWarrantyBadge(acc);
        if (badgeContainer) badgeContainer.innerHTML = meta.warrantyBadge;
        if (claimBtn) claimBtn.style.display = (meta.isWarrantyActive || acc.IsAlive === false) ? '' : 'none';
      }

      lastAccountsRenderKey = '';
      renderAccountsList(true);
    }

    function claimWarrantyDirectly(encodedToken) {
      const token = decodeURIComponent(encodedToken);
      openUrl('https://sharpbuy.org/#nfa-warranty?token=' + encodeURIComponent(token));
    }

    async function deleteAccountDirectly(steamId) {
      const bridge = await getBridge();
      if (bridge) bridge.DeleteSavedAccount(steamId);
      delete cachedGamesDb[steamId];
      saveCachedGamesDb();
      aggregateGamesFromCache();
    }

    async function importAccountsFromFile() {
      const bridge = await getBridge();
      if (!bridge) return;

      setStatus('loading', 'IMPORTING STEAM TOKENS...', 'Select a .txt file containing tokens (7656119...----ey...)');
      const resJson = await bridge.ImportTokensFromFileAsync();
      const res = JSON.parse(resJson || '{}');

      if (res.cancelled) {
        setStatus('loading', 'READY TO USE', 'Token import was cancelled.');
        return;
      }

      if (!res.success) {
        setStatus('error', 'IMPORT FAILED', res.error || 'Failed to parse tokens from file.');
        return;
      }

      const msg = 'Imported ' + res.imported + ' new account(s). Skipped: ' + res.skipped + ' (Total in history: ' + res.inHistory + ')';
      setStatus('success', 'IMPORT COMPLETE', msg);
      await loadAccountHistory(true);
      if (bridge.RefreshAllProfilesAsync) bridge.RefreshAllProfilesAsync();
    }

    function buildWarrantyBadge(acc) {
      if (acc.IsAlive === false) {
        return {
          warrantyBadge: warrantyBadgeHtml('dead', 'DEAD SESSION'),
          isWarrantyActive: false
        };
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = acc.WarrantyExpiresAt || 0;
      const left = expiresAt - now;

      if (left > 0) {
        const mins = Math.floor(left / 60);
        const secs = left % 60;
        const text = 'WARRANTY ' + mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
        return {
          warrantyBadge: warrantyBadgeHtml('active', text),
          isWarrantyActive: true
        };
      }

      if (expiresAt > 0) {
        return {
          warrantyBadge: warrantyBadgeHtml('expired', 'WARRANTY EXPIRED'),
          isWarrantyActive: false
        };
      }

      if (acc.ExpSeconds && acc.ExpSeconds > 0) {
        const days = Math.floor(acc.ExpSeconds / 86400);
        const text = days > 0 ? ('ALIVE (' + days + 'd)') : 'ALIVE (<1d)';
        return {
          warrantyBadge: warrantyBadgeHtml('active', text),
          isWarrantyActive: false
        };
      }

      return {
        warrantyBadge: warrantyBadgeHtml('active', 'ALIVE'),
        isWarrantyActive: false
      };
    }

    function startWarrantyTicker() {
      if (warrantyTicker) return;
      warrantyTicker = setInterval(updateWarrantyBadges, 1000);
    }

    function stopWarrantyTicker() {
      if (warrantyTicker) {
        clearInterval(warrantyTicker);
        warrantyTicker = null;
      }
    }

    function updateWarrantyBadges() {
      if (!isDrawerOpen || !savedAccountsCache || savedAccountsCache.length === 0) return;
      savedAccountsCache.forEach(function(acc) {
        const el = document.getElementById('badge-' + acc.SteamId);
        const claimBtn = document.getElementById('btn-claim-' + acc.SteamId);
        if (!el) return;
        const meta = buildWarrantyBadge(acc);
        el.innerHTML = meta.warrantyBadge;
        if (claimBtn) {
          claimBtn.style.display = (meta.isWarrantyActive || acc.IsAlive === false) ? '' : 'none';
        }
      });
    }

    function showClearConfirmModal() {
      document.getElementById('confirmTitle').innerText = 'Clear all saved accounts?';
      document.getElementById('confirmText').innerText = 'Are you sure you want to delete all saved accounts from the history? This cannot be undone.';
      document.getElementById('confirmOkBtn').onclick = confirmClearAllAccounts;
      document.getElementById('confirmOverlay').classList.add('active');
    }

    function closeConfirmModal() {
      document.getElementById('confirmOverlay').classList.remove('active');
    }

    async function confirmClearAllAccounts() {
      closeConfirmModal();
      const bridge = await getBridge();
      if (bridge) bridge.ClearAllSavedAccounts();
      savedAccountsCache = [];
      cachedGamesDb = {};
      allAggregatedGames = [];
      saveCachedGamesDb();
      lastAccountsRenderKey = '';
      renderAccountsList(true);
      document.getElementById('historyCount').innerText = '0';
      if (isPassportOpen) closePassportView();
      if (isAllGamesOpen) closeAllGamesView();
    }

    async function loadCachedGamesDb() {
      const bridge = await getBridge();
      if (!bridge) return;
      try {
        const str = await bridge.GetCachedGames();
        cachedGamesDb = JSON.parse(str || '{}');
        aggregateGamesFromCache();
      } catch (e) {
        cachedGamesDb = {};
      }
    }

    async function saveCachedGamesDb() {
      const bridge = await getBridge();
      if (!bridge) return;
      try {
        bridge.SaveCachedGames(JSON.stringify(cachedGamesDb));
      } catch (e) {}
    }

    function aggregateGamesFromCache() {
      const gameMap = {};
      let totalHours = 0;
      let scannedAccs = 0;

      const accountMap = {};
      (savedAccountsCache || []).forEach(function(a) {
        accountMap[a.SteamId] = a;
      });

      Object.keys(cachedGamesDb).forEach(function(steamId) {
        const cacheEntry = cachedGamesDb[steamId];
        if (!cacheEntry || !Array.isArray(cacheEntry.games)) return;
        scannedAccs++;
        const accInfo = accountMap[steamId] || {
          SteamId: steamId,
          PersonaName: steamId,
          AvatarUrl: '',
          Token: cacheEntry.token || ''
        };

        cacheEntry.games.forEach(function(game) {
          const appid = String(game.appid);
          if (!gameMap[appid]) {
            gameMap[appid] = {
              appid: appid,
              name: game.name || ('App ' + appid),
              iconUrl: game.iconUrl || '',
              iconFallbacks: game.iconFallbacks || [],
              totalHours: 0,
              accounts: []
            };
          }

          const hrs = Number(game.hours || 0);
          gameMap[appid].totalHours += hrs;
          totalHours += hrs;

          const exists = gameMap[appid].accounts.some(function(a) { return a.steamId === steamId; });
          if (!exists) {
            gameMap[appid].accounts.push({
              steamId: steamId,
              personaName: accInfo.PersonaName || accInfo.AccountName || steamId,
              avatarUrl: accInfo.AvatarUrl || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
              token: accInfo.Token || cacheEntry.token || '',
              hours: hrs
            });
          }
        });
      });

      allAggregatedGames = Object.values(gameMap);
      const totalGames = allAggregatedGames.length;

      const badge = document.getElementById('drawerAllGamesBadge');
      if (badge) {
        badge.innerText = totalGames;
      }

      const statGames = document.getElementById('statUniqueGames');
      if (statGames) {
        statGames.innerText = totalGames;
      }

      const statAccs = document.getElementById('statScannedAccounts');
      if (statAccs) {
        statAccs.innerText = scannedAccs;
      }

      const statHrs = document.getElementById('statTotalHours');
      if (statHrs) {
        statHrs.innerText = Math.round(totalHours) + 'h';
      }

      const sub = document.getElementById('allGamesSubtitle');
      if (sub) {
        if (totalGames > 0) {
          sub.innerText = totalGames + ' unique paid games across ' + scannedAccs + ' account(s)';
        } else {
          sub.innerText = 'All paid games aggregated across your saved accounts';
        }
      }
    }

    async function openAllGamesLibrary() {
      isAllGamesOpen = true;
      if (isPassportOpen) {
        passportLoadToken++;
        passportAccount = null;
        isPassportOpen = false;
        document.getElementById('passportView').style.display = 'none';
        document.querySelectorAll('.acc-card.selected').forEach(function(el) { el.classList.remove('selected'); });
      }

      document.getElementById('loginView').style.display = 'none';
      const hubEl = document.getElementById('allGamesView');
      hubEl.style.display = 'flex';
      hubEl.style.animation = 'none';
      void hubEl.offsetHeight;
      hubEl.style.animation = '';

      await applyWindowSize(true, true);
      await loadCachedGamesDb();

      if (allAggregatedGames.length === 0 && savedAccountsCache.length > 0) {
        await scanAllAccountsGames(false);
      } else {
        renderAllGamesGrid();
      }
    }

    async function closeAllGamesView() {
      isAllGamesOpen = false;
      document.getElementById('allGamesView').style.display = 'none';
      document.getElementById('loginView').style.display = 'flex';
      await applyWindowSize(false, true);
    }

    async function scanAllAccountsGames(forceAll) {
      if (isScanningAllGames) return;
      if (!savedAccountsCache || savedAccountsCache.length === 0) {
        setStatus('error', 'NO ACCOUNTS', 'No accounts in history to scan.');
        return;
      }

      isScanningAllGames = true;
      const progressContainer = document.getElementById('scanProgressContainer');
      const progressFill = document.getElementById('scanProgressFill');
      const progressText = document.getElementById('scanProgressText');
      const rescanBtn = document.getElementById('btnRescanAllGames');

      if (progressContainer) progressContainer.style.display = 'flex';
      if (rescanBtn) rescanBtn.disabled = true;

      const bridge = await getBridge();
      const accountsToScan = savedAccountsCache.filter(function(a) { return a && a.Token; });
      const total = accountsToScan.length;

      for (let i = 0; i < total; i++) {
        const acc = accountsToScan[i];
        const pct = Math.round(((i + 1) / total) * 100);
        if (progressFill) progressFill.style.width = pct + '%';
        if (progressText) {
          progressText.innerText = 'Scanning ' + (i + 1) + '/' + total + ' (' + (acc.PersonaName || acc.SteamId) + ')...';
        }

        const hasCached = cachedGamesDb[acc.SteamId] && Array.isArray(cachedGamesDb[acc.SteamId].games);
        if (forceAll || !hasCached) {
          try {
            if (bridge) {
              const resJson = await bridge.GetAccountLibraryAsync(acc.Token);
              const data = JSON.parse(resJson || '{}');
              if (data && data.success) {
                cachedGamesDb[acc.SteamId] = {
                  token: acc.Token,
                  timestamp: Date.now(),
                  games: data.games || [],
                  paidGameCount: data.paidGameCount || (data.games ? data.games.length : 0),
                  totalGameCount: data.totalGameCount || 0
                };
              }
            }
          } catch (e) {}
        }

        if ((i + 1) % 2 === 0 || i === total - 1) {
          aggregateGamesFromCache();
          renderAllGamesGrid();
        }
      }

      await saveCachedGamesDb();
      aggregateGamesFromCache();
      renderAllGamesGrid();

      if (progressContainer) progressContainer.style.display = 'none';
      if (rescanBtn) rescanBtn.disabled = false;
      isScanningAllGames = false;

      setStatus('success', 'LIBRARY SCAN COMPLETE', 'Aggregated ' + allAggregatedGames.length + ' unique games across ' + total + ' account(s).');
    }

    function gameBannerFallbackList(g) {
      const appid = String(g.appid);
      const list = [
        'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/' + appid + '/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/' + appid + '/header.jpg',
        'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/' + appid + '/capsule_616x353.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/' + appid + '/capsule_616x353.jpg',
        'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/' + appid + '/logo.png',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/' + appid + '/logo.png'
      ];
      if (g.iconUrl) list.push(g.iconUrl);
      if (g.iconFallbacks && g.iconFallbacks.length) {
        g.iconFallbacks.forEach(function(u) { if (u) list.push(u); });
      }
      var seen = {};
      return list.filter(function(u) {
        if (!u || seen[u]) return false;
        seen[u] = true;
        return true;
      });
    }

    function renderAllGamesGrid() {
      const grid = document.getElementById('allGamesGrid');
      if (!grid) return;

      if (!allAggregatedGames || allAggregatedGames.length === 0) {
        grid.innerHTML = '<div class="hub-state-msg">No games loaded yet.<br>Click <b style="color:#f97316;">RE-SCAN ALL</b> to scan and cache games from all history accounts.</div>';
        return;
      }

      let list = allAggregatedGames.slice();

      // Search filter
      const q = (allGamesSearchQuery || '').trim().toLowerCase();
      if (q) {
        list = list.filter(function(g) {
          return (g.name || '').toLowerCase().indexOf(q) !== -1 || String(g.appid).indexOf(q) !== -1;
        });
      }

      // Sort
      if (allGamesSortMode === 'accounts') {
        list.sort(function(a, b) {
          return b.accounts.length - a.accounts.length || b.totalHours - a.totalHours || a.name.localeCompare(b.name, 'en');
        });
      } else if (allGamesSortMode === 'hours') {
        list.sort(function(a, b) {
          return b.totalHours - a.totalHours || b.accounts.length - a.accounts.length || a.name.localeCompare(b.name, 'en');
        });
      } else if (allGamesSortMode === 'alpha') {
        list.sort(function(a, b) {
          return (a.name || '').localeCompare(b.name || '', 'en');
        });
      }

      if (list.length === 0) {
        grid.innerHTML = '<div class="hub-state-msg">No games found matching "' + escapeHtml(allGamesSearchQuery) + '"</div>';
        return;
      }

      let html = '';
      list.forEach(function(g) {
        const banners = gameBannerFallbackList(g);
        const fallbackData = banners.slice(1).join('|').replace(/"/g, '');
        const accCount = g.accounts.length;
        const accLabel = accCount === 1 ? '1 ACC' : (accCount + ' ACCS');
        const hrsLabel = formatGameHours(g.totalHours);

        html += `
          <div class="hub-game-card" onclick="openGameAccountsModal('${g.appid}')" title="${escapeHtml(g.name)}">
            <div class="hub-game-thumb-wrap">
              <img src="${banners[0]}" class="hub-game-thumb" alt="" loading="lazy" data-fallbacks="${fallbackData}" data-fallback-idx="0" onerror="handleGameIconError(this)" />
              <div class="hub-game-acc-badge">
                <svg class="ui-icon" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ${accLabel}
              </div>
            </div>
            <div class="hub-game-details">
              <div class="hub-game-name">${escapeHtml(g.name)}</div>
              <div class="hub-game-meta">
                <span class="hub-game-hours">⏳ ${hrsLabel}</span>
                <span style="color:#f97316;font-weight:700;">PLAY ⚡</span>
              </div>
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;
    }

    function filterAllGames(query) {
      allGamesSearchQuery = query || '';
      const clearBtn = document.getElementById('allGamesClearBtn');
      if (clearBtn) {
        clearBtn.style.display = allGamesSearchQuery ? 'inline-block' : 'none';
      }
      renderAllGamesGrid();
    }

    function clearAllGamesSearch() {
      allGamesSearchQuery = '';
      const inp = document.getElementById('allGamesSearchInput');
      if (inp) inp.value = '';
      const clearBtn = document.getElementById('allGamesClearBtn');
      if (clearBtn) clearBtn.style.display = 'none';
      renderAllGamesGrid();
    }

    function applyAllGamesSort() {
      const sel = document.getElementById('allGamesSortSelect');
      if (sel) {
        allGamesSortMode = sel.value || 'accounts';
      }
      renderAllGamesGrid();
    }

    function openGameAccountsModal(appid) {
      const game = (allAggregatedGames || []).find(function(g) { return String(g.appid) === String(appid); });
      if (!game) return;

      selectedGameForModal = game;
      const modal = document.getElementById('gameAccountsModal');
      const titleEl = document.getElementById('gameDialogTitle');
      const metaEl = document.getElementById('gameDialogMeta');
      const imgEl = document.getElementById('gameDialogImg');
      const listEl = document.getElementById('gameDialogAccountsList');

      const banners = gameBannerFallbackList(game);
      if (imgEl) {
        imgEl.src = banners[0];
        imgEl.dataset.fallbacks = banners.slice(1).join('|').replace(/"/g, '');
        imgEl.dataset.fallbackIdx = '0';
      }

      if (titleEl) titleEl.innerText = game.name;
      if (metaEl) {
        metaEl.innerText = 'AppID: ' + game.appid + ' · Total Playtime: ' + formatGameHours(game.totalHours) + ' · ' + game.accounts.length + ' Account(s)';
      }

      if (listEl) {
        let accsHtml = '';
        game.accounts.forEach(function(acc) {
          const safeToken = encodeURIComponent(acc.token);
          const hrs = formatGameHours(acc.hours);
          accsHtml += `
            <div class="game-acc-item">
              <div class="game-acc-left">
                <img src="${acc.avatarUrl}" class="game-acc-avatar" alt="" onerror="this.src='https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg'" />
                <div class="game-acc-info">
                  <span class="game-acc-name">${escapeHtml(acc.personaName)}</span>
                  <span class="game-acc-sub">${acc.steamId} · ⏳ ${hrs} played</span>
                </div>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn-game-acc-login" onclick="loginGameAccountDirectly('${safeToken}', false)">
                  <svg class="ui-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  PLAY
                </button>
                <button class="btn-acc-offline-sm" onclick="loginGameAccountDirectly('${safeToken}', true)" title="Play in Offline Mode">
                  🛡️ OFFLINE
                </button>
              </div>
            </div>
          `;
        });
        listEl.innerHTML = accsHtml;
      }

      if (modal) modal.classList.add('active');
    }

    function closeGameAccountsModal() {
      const modal = document.getElementById('gameAccountsModal');
      if (modal) modal.classList.remove('active');
      selectedGameForModal = null;
    }

    async function loginGameAccountDirectly(encodedToken, isOffline) {
      closeGameAccountsModal();
      if (isOffline) {
        await loginDirectlyOffline(encodedToken);
      } else {
        await loginDirectly(encodedToken);
      }
    }

    function onOwnerDetectedAlert(steamId, accountName, reason) {
      var modal = document.getElementById('ownerAlertOverlay');
      var desc = document.getElementById('ownerAlertDesc');
      if (desc) {
        desc.innerText = 'Владелец зашел в Steam или запустил игру на своем ПК (' + (reason || 'Активность в сети') + '). Игра и Steam были экстренно закрыты лаунчером для 100% защиты от обнаружения.';
      }
      if (modal) modal.classList.add('active');
      setStatus('error', 'OWNER DETECTED IN GAME', reason || 'Emergency stealth shutdown');
      loadAccountHistory(true);
    }

    function dismissOwnerAlert() {
      var modal = document.getElementById('ownerAlertOverlay');
      if (modal) modal.classList.remove('active');
    }

    async function onTitleMouseDown(e) {
      if (e.button !== 0) return;
      var target = e.target;
      if (target && target.closest && target.closest('button, input, textarea, select, a, .win-btn, .history-toggle-btn, .link-action, .acc-card, .passport-back, .tools-panel, .footer-item, .modal, .dialog, .owner-alert-dialog')) {
        return;
      }
      const bridge = await getBridge();
      if (bridge) bridge.OnDragWindow();
    }

    async function onMinimize(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      document.body.classList.add('window-minimizing');
      await new Promise(function(r) { requestAnimationFrame(function() { requestAnimationFrame(r); }); });
      const bridge = await getBridge();
      if (bridge && bridge.MinimizeAnimated) {
        await bridge.MinimizeAnimated(380);
      } else if (bridge) {
        bridge.Minimize();
      }
      document.body.classList.remove('window-minimizing');
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
      if (el && newPath) el.innerText = newPath.split('\\').join('/');
    }

    async function launchSteam() {
      var el = document.getElementById('tokenInput');
      var token = el ? el.value.trim() : '';
      if (!token || token.length < 3) {
        setStatus('error', 'TOKEN MISSING', 'Please paste the Steam NFA session token into the field above.');
        return;
      }

      setStatus('loading', 'INJECTING SESSION (STEALTH GUARD ACTIVE)...', 'Stopping Steam, configuring Stealth Mode (RemotePlay OFF, Invisible) & launching Steam.');
      const bridge = await getBridge();
      if (bridge && bridge.LaunchSteamStealth) {
        bridge.LaunchSteamStealth(token, false);
      } else if (bridge) {
        bridge.LaunchSteam(token);
      }
    }

    async function launchSteamOffline() {
      var el = document.getElementById('tokenInput');
      var token = el ? el.value.trim() : '';
      if (!token || token.length < 3) {
        setStatus('error', 'TOKEN MISSING', 'Please paste the Steam NFA session token into the field above.');
        return;
      }

      setStatus('loading', 'INJECTING OFFLINE SESSION...', 'Starting Steam in isolated Offline Mode. Valve servers will not see you.');
      const bridge = await getBridge();
      if (bridge && bridge.LaunchSteamStealth) {
        bridge.LaunchSteamStealth(token, true);
      } else if (bridge) {
        bridge.LaunchSteam(token);
      }
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

    function showClearSteamSessionsConfirm() {
      document.getElementById('confirmTitle').innerText = 'Clear all Steam accounts?';
      document.getElementById('confirmText').innerText = 'This removes every saved Steam session on this PC (loginusers.vdf, session cache, remembered accounts). Launcher history is kept. Steam must be closed.';
      document.getElementById('confirmOkBtn').onclick = confirmClearSteamSessions;
      document.getElementById('confirmOverlay').classList.add('active');
    }

    async function confirmClearSteamSessions() {
      closeConfirmModal();
      const bridge = await getBridge();
      if (!bridge) return;
      setStatus('loading', 'CLEARING STEAM ACCOUNTS...', 'Removing all saved Steam sessions from this PC...');
      const ok = await bridge.ClearAllSteamSessions();
      if (ok) {
        setStatus('success', 'STEAM ACCOUNTS CLEARED', 'All saved Steam sessions removed. Use LOGIN to enter a fresh account.');
      } else {
        setStatus('error', 'CLEAR FAILED', 'Could not remove Steam session files. Close Steam and try again.');
      }
    }

    async function killSteam() {
      const bridge = await getBridge();
      if (bridge) {
        if (bridge.EmergencyKill) {
          bridge.EmergencyKill();
        } else {
          bridge.KillSteam();
        }
        setStatus('success', 'PROCESSES TERMINATED', 'All steam.exe and game processes have been stopped.');
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
  </script>"""

content = content[:script_start] + js_code + content[script_end:]

with open(out_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated clean {out_path}, total size: {len(content)} bytes")

# Verify with node --check
script_match = re.search(r"<script>([\s\S]*?)</script>", content)
if script_match:
    with open(r"c:\Users\iliyk\Desktop\SharpBuy\scripts\test_script.js", "w", encoding="utf-8") as tf:
        tf.write(script_match.group(1))
    res = subprocess.run(["node", "--check", r"c:\Users\iliyk\Desktop\SharpBuy\scripts\test_script.js"], capture_output=True, text=True)
    print("Node check exit code:", res.returncode)
    if res.returncode != 0:
        print("ERROR in JS:", res.stderr)
    else:
        print("SUCCESS: JavaScript syntax is 100% VALID!")
