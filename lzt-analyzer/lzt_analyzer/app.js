/**
 * LZT Quant Terminal — Quiet Precision Controller (Radix Sand Scale v2)
 * Linear x Attio x Radix Colors x Apple Fitness Architecture
 */

const STATE = {
  theme: localStorage.getItem('lzt_theme') || 'light', // 'light' | 'dark'
  currency: 'EUR', // 'EUR' | 'RUB'
  eurRubRate: 100.0,
  activeMode: 'single', // 'single' | 'bundle' | 'scanner'
  searchSource: 'live', // 'live' (direct LZT Market API) | 'db' (SQLite cache 128k+)
  
  // Search & Filter Parameters
  filters: {
    gameTitles: ['Counter-Strike 2'],
    gamesMatchMode: 'all',
    cs2Prime: true,
    noVac: true,
    hidePhishing: false,
    itemOrigin: 'any',
    minPrice: 0,
    maxPrice: 5000,
    minDaybreak: 0,
    maxHours2w: 100,
    minLevel: 0,
    maxLevel: 0,
    minPoints: 0,
    maxPoints: 0,
    minPotLevel: 0,
    maxPotLevel: 0,
    emailType: 'any',
    guarantee: 'any',
    minScore: 0,
    query: '',
    sortBy: 'price_asc',
    page: 1,
    limit: 24
  },

  // Co-op Bundle Matcher PRO Filters
  bundleFilters: {
    partySize: 2,
    category: 'all',
    maxTotalPrice: null,
    minDaybreak: 0,
    sortBy: 'shared_games',
    mustHave: [],
    source: 'db', // 'db' | 'live'
    limit: 24
  },

  // Comparison Deck & Starred
  comparedItems: new Map(),
  starredItems: new Set(),

  // Data Store
  items: [],
  totalCount: 0,
  bundles: [],
  scannerStatus: null,
  indexerTimer: null
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initThemeController();
  initNavigation();
  initSystemControls();
  initSidebarFilters();
  initPresets();
  initBundleControls();
  initScannerControls();
  initModals();

  // Initial Data Load
  syncSidebarUI();
  loadSingleListings();
  startScannerPolling();
});

// ==========================================================================
// THEME CONTROLLER (Light & Dark Theme Switcher with localStorage persistence)
// ==========================================================================
function initThemeController() {
  const lightBtn = document.getElementById('themeLightBtn');
  const darkBtn = document.getElementById('themeDarkBtn');
  const capsule = document.getElementById('themeSwitchCapsule');

  function applyTheme(theme, save = true) {
    STATE.theme = theme;
    if (save) {
      localStorage.setItem('lzt_theme', theme);
    }

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
      lightBtn?.classList.remove('active');
      darkBtn?.classList.add('active');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
      lightBtn?.classList.add('active');
      darkBtn?.classList.remove('active');
    }
  }

  // Individual button handlers
  lightBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    applyTheme('light');
  });

  darkBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    applyTheme('dark');
  });

  // Toggle when clicking container outside buttons
  capsule?.addEventListener('click', (e) => {
    if (e.target === capsule) {
      const nextTheme = STATE.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    }
  });

  // Apply initial theme
  applyTheme(STATE.theme, false);
}

// ==========================================================================
// NAVIGATION & HEADER CONTROLS
// ==========================================================================
function initNavigation() {
  const navButtons = [
    { btn: document.getElementById('modeSingleBtn'), mode: 'single', view: document.getElementById('singleListingsView') },
    { btn: document.getElementById('modeBundleBtn'), mode: 'bundle', view: document.getElementById('bundleListingsView') },
    { btn: document.getElementById('modeScannerBtn'), mode: 'scanner', view: document.getElementById('scannerTerminalView') }
  ];

  function switchMode(targetMode) {
    STATE.activeMode = targetMode;

    navButtons.forEach(({ btn, mode, view }) => {
      if (mode === targetMode) {
        btn?.classList.add('active');
        if (view) view.style.display = (mode === 'single' ? 'grid' : 'block');
      } else {
        btn?.classList.remove('active');
        if (view) view.style.display = 'none';
      }
    });

    if (targetMode === 'bundle') {
      loadBundleListings();
    } else if (targetMode === 'single') {
      if (STATE.items.length === 0) {
        loadSingleListings();
      }
    }
  }

  navButtons.forEach(({ btn, mode }) => {
    btn?.addEventListener('click', () => switchMode(mode));
  });

  // Also support any nav-btn elements with data-view
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.view;
      if (mode) switchMode(mode);
    });
  });
}

function initSystemControls() {
  // Currency Toggle (EUR / RUB)
  const currEur = document.getElementById('currencyEurBtn');
  const currRub = document.getElementById('currencyRubBtn');

  currEur?.addEventListener('click', () => {
    STATE.currency = 'EUR';
    currEur.classList.add('active');
    currRub.classList.remove('active');
    if (STATE.activeMode === 'bundle') {
      loadBundleListings();
    } else {
      renderCurrentItems();
    }
  });

  currRub?.addEventListener('click', () => {
    STATE.currency = 'RUB';
    currRub.classList.add('active');
    currEur.classList.remove('active');
    if (STATE.activeMode === 'bundle') {
      loadBundleListings();
    } else {
      renderCurrentItems();
    }
  });

  // Source Switcher (Live LZT API vs SQLite Local DB)
  const sourceLiveBtn = document.getElementById('sourceLiveBtn');
  const sourceDbBtn = document.getElementById('sourceDbBtn');

  sourceLiveBtn?.addEventListener('click', () => {
    STATE.searchSource = 'live';
    sourceLiveBtn.classList.add('active');
    sourceDbBtn.classList.remove('active');
    STATE.filters.page = 1;
    loadSingleListings();
  });

  sourceDbBtn?.addEventListener('click', () => {
    STATE.searchSource = 'db';
    sourceDbBtn.classList.add('active');
    sourceLiveBtn.classList.remove('active');
    STATE.filters.page = 1;
    loadSingleListings();
  });

  initHarvestController();
}

function initHarvestController() {
  const harvestBtn = document.getElementById('harvestQueryBtn');
  const harvestBadge = document.getElementById('harvestStatusBadge');
  let pollInterval = null;

  async function checkHarvestStatus() {
    try {
      const resp = await fetch('/api/indexer/status');
      const status = await resp.json();
      if (status.mode === 'targeted_harvest' && status.is_running) {
        harvestBtn?.classList.add('running');
        if (harvestBadge) {
          harvestBadge.textContent = `Стр. ${status.current_page} (${status.total_items_indexed} шт)`;
        }
      } else {
        if (harvestBtn?.classList.contains('running')) {
          harvestBtn.classList.remove('running');
          if (harvestBadge) {
            harvestBadge.textContent = `✅ Готово (${status.total_items_indexed || 'Все'})`;
          }
          if (pollInterval) clearInterval(pollInterval);
          // Automatically switch to SQLite database view and refresh results
          STATE.searchSource = 'db';
          const sourceLiveBtn = document.getElementById('sourceLiveBtn');
          const sourceDbBtn = document.getElementById('sourceDbBtn');
          sourceDbBtn?.classList.add('active');
          sourceLiveBtn?.classList.remove('active');
          STATE.filters.page = 1;
          loadSingleListings();
        }
      }
    } catch (e) {
      console.error('Harvest polling error:', e);
    }
  }

  harvestBtn?.addEventListener('click', async () => {
    if (harvestBtn.classList.contains('running')) {
      await fetch('/api/indexer/stop');
      harvestBtn.classList.remove('running');
      if (harvestBadge) harvestBadge.textContent = 'Остановлено';
      if (pollInterval) clearInterval(pollInterval);
      return;
    }

    const params = new URLSearchParams();
    if (STATE.filters.gameTitles && STATE.filters.gameTitles.length) {
      STATE.filters.gameTitles.forEach(g => params.append('game', g));
    }
    if (STATE.filters.cs2Prime) params.append('cs2_prime', '1');
    if (STATE.filters.minPrice > 0) params.append('min_price', STATE.filters.minPrice);
    if (STATE.filters.maxPrice > 0 && STATE.filters.maxPrice < 100000) params.append('max_price', STATE.filters.maxPrice);
    if (STATE.filters.minDaybreak > 0) params.append('min_daybreak', STATE.filters.minDaybreak);
    if (STATE.filters.maxHours2w < 100) params.append('max_hours_2w', STATE.filters.maxHours2w);
    if (STATE.filters.minLevel > 0) params.append('min_level', STATE.filters.minLevel);
    if (STATE.filters.maxLevel > 0) params.append('max_level', STATE.filters.maxLevel);
    if (STATE.filters.minPoints > 0) params.append('min_points', STATE.filters.minPoints);
    if (STATE.filters.maxPoints > 0) params.append('max_points', STATE.filters.maxPoints);
    if (STATE.filters.minPotLevel > 0) params.append('min_pot_level', STATE.filters.minPotLevel);
    if (STATE.filters.maxPotLevel > 0) params.append('max_pot_level', STATE.filters.maxPotLevel);
    if (STATE.filters.itemOrigin && STATE.filters.itemOrigin !== 'any') params.append('item_origin', STATE.filters.itemOrigin);
    if (STATE.filters.emailType && STATE.filters.emailType !== 'any') params.append('email_type', STATE.filters.emailType);
    params.append('sort', STATE.filters.sortBy);
    params.append('max_pages', '200');

    harvestBtn.classList.add('running');
    if (harvestBadge) harvestBadge.textContent = 'Сбор (x6 потоков)...';

    try {
      await fetch(`/api/indexer/harvest_target?${params.toString()}`);
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(checkHarvestStatus, 1500);
      checkHarvestStatus();
    } catch (e) {
      harvestBtn.classList.remove('running');
      if (harvestBadge) harvestBadge.textContent = 'Ошибка';
    }
  });

  checkHarvestStatus();
}

// ==========================================================================
// PRESETS
// ==========================================================================
function initPresets() {
  const presetBtns = document.querySelectorAll('.preset-pill');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      presetBtns.forEach(b => b.classList.remove('active'));
      
      if (!wasActive) {
        btn.classList.add('active');
        const val = btn.dataset.presetVal;

        if (val === 'cs2_prime') {
          STATE.filters.gameTitles = ['Counter-Strike 2'];
          STATE.filters.cs2Prime = true;
          STATE.filters.minScore = 85;
          STATE.filters.minDaybreak = 30;
        } else if (val === 'aging_long') {
          STATE.filters.minDaybreak = 90;
          STATE.filters.maxHours2w = 0;
          STATE.filters.minScore = 0;
        } else if (val === 'budget_gems') {
          STATE.filters.maxPrice = 1500;
          STATE.filters.minScore = 75;
        }
      } else {
        STATE.filters.minScore = 0;
      }

      syncSidebarUI();
      loadSingleListings();
    });
  });
}

function renderActiveChipsRibbon() {
  const container = document.getElementById('sidebarActiveChips');
  if (!container) return;

  const chips = [];
  if (STATE.filters.hidePhishing) {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('hidePhishing')">● 🛡️ БЕЗ ФИШИНГА <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.itemOrigin && STATE.filters.itemOrigin !== 'any') {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('origin')">● ПРОИСХОЖДЕНИЕ: ${STATE.filters.itemOrigin.toUpperCase()} <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.minScore > 0) {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('score')">● SCORE ${STATE.filters.minScore}+ <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.cs2Prime) {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('cs2')">● CS2 PRIME <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.minDaybreak > 0) {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('daybreak')">● DORMANT > ${STATE.filters.minDaybreak}D <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.maxHours2w === 0) {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('hours')">● 0.0h INACTIVE <button class="pill-remove">✕</button></span>`);
  } else if (STATE.filters.maxHours2w < 100) {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('hours')">● &lt;${STATE.filters.maxHours2w}h 2WKS <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.emailType && STATE.filters.emailType !== 'any') {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('email')">● MAIL: ${STATE.filters.emailType.toUpperCase()} <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.noVac) {
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('vac')">● NO VAC <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.minLevel > 0 || STATE.filters.maxLevel > 0) {
    const lvlText = (STATE.filters.minLevel > 0 && STATE.filters.maxLevel > 0) 
      ? `LVL ${STATE.filters.minLevel}-${STATE.filters.maxLevel}`
      : (STATE.filters.minLevel > 0 ? `LVL ${STATE.filters.minLevel}+` : `LVL ≤${STATE.filters.maxLevel}`);
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('level')">● 📈 ${lvlText} <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.minPoints > 0 || STATE.filters.maxPoints > 0) {
    const ptsText = (STATE.filters.minPoints > 0 && STATE.filters.maxPoints > 0)
      ? `PTS ${STATE.filters.minPoints}-${STATE.filters.maxPoints}`
      : (STATE.filters.minPoints > 0 ? `PTS ${STATE.filters.minPoints}+` : `PTS ≤${STATE.filters.maxPoints}`);
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('points')">● 💎 ${ptsText} <button class="pill-remove">✕</button></span>`);
  }
  if (STATE.filters.minPotLevel > 0 || STATE.filters.maxPotLevel > 0) {
    const potText = (STATE.filters.minPotLevel > 0 && STATE.filters.maxPotLevel > 0)
      ? `POT-LVL ${STATE.filters.minPotLevel}-${STATE.filters.maxPotLevel}`
      : (STATE.filters.minPotLevel > 0 ? `POT-LVL ${STATE.filters.minPotLevel}+` : `POT-LVL ≤${STATE.filters.maxPotLevel}`);
    chips.push(`<span class="filter-pill active" onclick="removeFilterPill('potLevel')">● 🔮 ${potText} <button class="pill-remove">✕</button></span>`);
  }

  container.innerHTML = chips.join('');
}

window.removeFilterPill = function(type) {
  if (type === 'score') STATE.filters.minScore = 0;
  else if (type === 'cs2') STATE.filters.cs2Prime = false;
  else if (type === 'daybreak') STATE.filters.minDaybreak = 0;
  else if (type === 'hours') STATE.filters.maxHours2w = 100;
  else if (type === 'email') STATE.filters.emailType = 'any';
  else if (type === 'origin') STATE.filters.itemOrigin = 'any';
  else if (type === 'hidePhishing') STATE.filters.hidePhishing = false;
  else if (type === 'vac') STATE.filters.noVac = false;
  else if (type === 'level') {
    STATE.filters.minLevel = 0;
    STATE.filters.maxLevel = 0;
  }
  else if (type === 'points') {
    STATE.filters.minPoints = 0;
    STATE.filters.maxPoints = 0;
  }
  else if (type === 'potLevel') {
    STATE.filters.minPotLevel = 0;
    STATE.filters.maxPotLevel = 0;
  }

  syncSidebarUI();
  STATE.filters.page = 1;
  loadSingleListings();
};

function syncSidebarUI() {
  const agingSlider = document.getElementById('minDaybreakSlider');
  const agingVal = document.getElementById('agingValDisplay');
  const activitySlider = document.getElementById('maxHoursSlider');
  const activityVal = document.getElementById('activityValDisplay');
  const cs2PrimeChk = document.getElementById('cs2PrimeChk');
  const switchRowCs2 = document.getElementById('switchRowCs2');
  const noVacChk = document.getElementById('noVacChk');
  const switchRowVac = document.getElementById('switchRowVac');
  const hidePhishingChk = document.getElementById('hidePhishingChk');
  const switchRowHidePhishing = document.getElementById('switchRowHidePhishing');
  const itemOriginSelect = document.getElementById('itemOriginSelect');
  const emailSel = document.getElementById('emailTypeSelect');
  const maxPriceInput = document.getElementById('maxPriceInput');
  const minPriceInput = document.getElementById('minPriceInput');
  const minLevelInput = document.getElementById('minLevelInput');
  const maxLevelInput = document.getElementById('maxLevelInput');
  const levelRangeDisplay = document.getElementById('levelRangeDisplay');
  const minPointsInput = document.getElementById('minPointsInput');
  const maxPointsInput = document.getElementById('maxPointsInput');
  const pointsRangeDisplay = document.getElementById('pointsRangeDisplay');
  const minPotLevelInput = document.getElementById('minPotLevelInput');
  const maxPotLevelInput = document.getElementById('maxPotLevelInput');
  const potLevelRangeDisplay = document.getElementById('potLevelRangeDisplay');
  const sortSelect = document.getElementById('sortSelect');

  if (agingSlider) agingSlider.value = STATE.filters.minDaybreak;
  if (agingVal) agingVal.textContent = `${STATE.filters.minDaybreak}d+`;
  if (activitySlider) activitySlider.value = STATE.filters.maxHours2w;
  if (activityVal) activityVal.textContent = STATE.filters.maxHours2w === 0 ? '0h (Чисто ✓)' : `<${STATE.filters.maxHours2w}h`;
  if (cs2PrimeChk) cs2PrimeChk.checked = STATE.filters.cs2Prime;
  if (switchRowCs2) switchRowCs2.classList.toggle('active', STATE.filters.cs2Prime);
  if (noVacChk) noVacChk.checked = STATE.filters.noVac;
  if (switchRowVac) switchRowVac.classList.toggle('active', STATE.filters.noVac);
  if (hidePhishingChk) hidePhishingChk.checked = STATE.filters.hidePhishing;
  if (switchRowHidePhishing) switchRowHidePhishing.classList.toggle('active', STATE.filters.hidePhishing);
  if (itemOriginSelect) itemOriginSelect.value = STATE.filters.itemOrigin || 'any';
  if (emailSel) emailSel.value = STATE.filters.emailType || 'any';
  if (maxPriceInput) maxPriceInput.value = STATE.filters.maxPrice;
  if (minPriceInput) minPriceInput.value = STATE.filters.minPrice;

  if (minLevelInput) minLevelInput.value = STATE.filters.minLevel || '';
  if (maxLevelInput) maxLevelInput.value = STATE.filters.maxLevel || '';
  if (levelRangeDisplay) {
    if (STATE.filters.minLevel > 0 && STATE.filters.maxLevel > 0) {
      levelRangeDisplay.textContent = `${STATE.filters.minLevel} — ${STATE.filters.maxLevel}`;
    } else if (STATE.filters.minLevel > 0) {
      levelRangeDisplay.textContent = `${STATE.filters.minLevel}+`;
    } else if (STATE.filters.maxLevel > 0) {
      levelRangeDisplay.textContent = `До ${STATE.filters.maxLevel}`;
    } else {
      levelRangeDisplay.textContent = 'Любой';
    }
  }

  if (minPointsInput) minPointsInput.value = STATE.filters.minPoints || '';
  if (maxPointsInput) maxPointsInput.value = STATE.filters.maxPoints || '';
  if (pointsRangeDisplay) {
    if (STATE.filters.minPoints > 0 && STATE.filters.maxPoints > 0) {
      pointsRangeDisplay.textContent = `${STATE.filters.minPoints} — ${STATE.filters.maxPoints}`;
    } else if (STATE.filters.minPoints > 0) {
      pointsRangeDisplay.textContent = `${STATE.filters.minPoints}+`;
    } else if (STATE.filters.maxPoints > 0) {
      pointsRangeDisplay.textContent = `До ${STATE.filters.maxPoints}`;
    } else {
      pointsRangeDisplay.textContent = 'Любые';
    }
  }

  if (minPotLevelInput) minPotLevelInput.value = STATE.filters.minPotLevel || '';
  if (maxPotLevelInput) maxPotLevelInput.value = STATE.filters.maxPotLevel || '';
  if (potLevelRangeDisplay) {
    if (STATE.filters.minPotLevel > 0 && STATE.filters.maxPotLevel > 0) {
      potLevelRangeDisplay.textContent = `${STATE.filters.minPotLevel} — ${STATE.filters.maxPotLevel}`;
    } else if (STATE.filters.minPotLevel > 0) {
      potLevelRangeDisplay.textContent = `${STATE.filters.minPotLevel}+`;
    } else if (STATE.filters.maxPotLevel > 0) {
      potLevelRangeDisplay.textContent = `До ${STATE.filters.maxPotLevel}`;
    } else {
      potLevelRangeDisplay.textContent = 'Любой';
    }
  }

  if (sortSelect) sortSelect.value = STATE.filters.sortBy;

  renderGameChips();
  renderActiveChipsRibbon();
  updateResetBadge();
}

// ==========================================================================
// SIDEBAR FILTERS (QUIET PRECISION)
// ==========================================================================
function initSidebarFilters() {
  const agingSlider = document.getElementById('minDaybreakSlider');
  const agingVal = document.getElementById('agingValDisplay');

  agingSlider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    STATE.filters.minDaybreak = val;
    STATE.filters.page = 1;
    if (agingVal) agingVal.textContent = `${val}d+`;
    updateResetBadge();
    debounceSearch();
  });

  const activitySlider = document.getElementById('maxHoursSlider');
  const activityVal = document.getElementById('activityValDisplay');

  activitySlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    STATE.filters.maxHours2w = val;
    STATE.filters.page = 1;
    if (activityVal) activityVal.textContent = val === 0 ? '0h (Чисто ✓)' : `<${val}h`;
    updateResetBadge();
    debounceSearch();
  });

  const quickSearch = document.getElementById('quickSearchInput');
  quickSearch?.addEventListener('input', (e) => {
    STATE.filters.query = e.target.value.trim();
    STATE.filters.page = 1;
    updateResetBadge();
    debounceSearch();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      quickSearch?.focus();
    }
  });

  // Sort Select
  const sortSelect = document.getElementById('sortSelect');
  sortSelect?.addEventListener('change', (e) => {
    STATE.filters.sortBy = e.target.value;
    STATE.filters.page = 1;
    loadSingleListings();
  });

  // Switches
  const cs2PrimeChk = document.getElementById('cs2PrimeChk');
  const switchRowCs2 = document.getElementById('switchRowCs2');
  cs2PrimeChk?.addEventListener('change', (e) => {
    STATE.filters.cs2Prime = e.target.checked;
    STATE.filters.page = 1;
    switchRowCs2?.classList.toggle('active', e.target.checked);
    updateResetBadge();
    debounceSearch();
  });

  const noVacChk = document.getElementById('noVacChk');
  const switchRowVac = document.getElementById('switchRowVac');
  noVacChk?.addEventListener('change', (e) => {
    STATE.filters.noVac = e.target.checked;
    STATE.filters.page = 1;
    switchRowVac?.classList.toggle('active', e.target.checked);
    updateResetBadge();
    debounceSearch();
  });

  const hidePhishingChk = document.getElementById('hidePhishingChk');
  const switchRowHidePhishing = document.getElementById('switchRowHidePhishing');
  hidePhishingChk?.addEventListener('change', (e) => {
    STATE.filters.hidePhishing = e.target.checked;
    STATE.filters.page = 1;
    switchRowHidePhishing?.classList.toggle('active', e.target.checked);
    updateResetBadge();
    debounceSearch();
  });

  // Dropdowns
  const originSel = document.getElementById('itemOriginSelect');
  originSel?.addEventListener('change', (e) => {
    STATE.filters.itemOrigin = e.target.value;
    STATE.filters.page = 1;
    updateResetBadge();
    debounceSearch();
  });

  const emailSel = document.getElementById('emailTypeSelect');
  emailSel?.addEventListener('change', (e) => {
    STATE.filters.emailType = e.target.value;
    STATE.filters.page = 1;
    updateResetBadge();
    debounceSearch();
  });

  const guarSel = document.getElementById('guaranteeSelect');
  guarSel?.addEventListener('change', (e) => {
    STATE.filters.guarantee = e.target.value;
    STATE.filters.page = 1;
    updateResetBadge();
    debounceSearch();
  });

  // Steam Level (От / До)
  const minLevelInput = document.getElementById('minLevelInput');
  const maxLevelInput = document.getElementById('maxLevelInput');
  const levelRangeDisplay = document.getElementById('levelRangeDisplay');

  function updateLevelFilter() {
    STATE.filters.minLevel = parseInt(minLevelInput?.value, 10) || 0;
    STATE.filters.maxLevel = parseInt(maxLevelInput?.value, 10) || 0;
    STATE.filters.page = 1;
    if (levelRangeDisplay) {
      if (STATE.filters.minLevel > 0 && STATE.filters.maxLevel > 0) {
        levelRangeDisplay.textContent = `${STATE.filters.minLevel} — ${STATE.filters.maxLevel}`;
      } else if (STATE.filters.minLevel > 0) {
        levelRangeDisplay.textContent = `${STATE.filters.minLevel}+`;
      } else if (STATE.filters.maxLevel > 0) {
        levelRangeDisplay.textContent = `До ${STATE.filters.maxLevel}`;
      } else {
        levelRangeDisplay.textContent = 'Любой';
      }
    }
    updateResetBadge();
    debounceSearch();
  }
  minLevelInput?.addEventListener('input', updateLevelFilter);
  maxLevelInput?.addEventListener('input', updateLevelFilter);

  // Steam Points (От / До)
  const minPointsInput = document.getElementById('minPointsInput');
  const maxPointsInput = document.getElementById('maxPointsInput');
  const pointsRangeDisplay = document.getElementById('pointsRangeDisplay');

  function updatePointsFilter() {
    STATE.filters.minPoints = parseInt(minPointsInput?.value, 10) || 0;
    STATE.filters.maxPoints = parseInt(maxPointsInput?.value, 10) || 0;
    STATE.filters.page = 1;
    if (pointsRangeDisplay) {
      if (STATE.filters.minPoints > 0 && STATE.filters.maxPoints > 0) {
        pointsRangeDisplay.textContent = `${STATE.filters.minPoints} — ${STATE.filters.maxPoints}`;
      } else if (STATE.filters.minPoints > 0) {
        pointsRangeDisplay.textContent = `${STATE.filters.minPoints}+`;
      } else if (STATE.filters.maxPoints > 0) {
        pointsRangeDisplay.textContent = `До ${STATE.filters.maxPoints}`;
      } else {
        pointsRangeDisplay.textContent = 'Любые';
      }
    }
    updateResetBadge();
    debounceSearch();
  }
  minPointsInput?.addEventListener('input', updatePointsFilter);
  maxPointsInput?.addEventListener('input', updatePointsFilter);

  // Potential Steam Level (От / До)
  const minPotLevelInput = document.getElementById('minPotLevelInput');
  const maxPotLevelInput = document.getElementById('maxPotLevelInput');
  const potLevelRangeDisplay = document.getElementById('potLevelRangeDisplay');

  function updatePotLevelFilter() {
    STATE.filters.minPotLevel = parseInt(minPotLevelInput?.value, 10) || 0;
    STATE.filters.maxPotLevel = parseInt(maxPotLevelInput?.value, 10) || 0;
    STATE.filters.page = 1;
    if (potLevelRangeDisplay) {
      if (STATE.filters.minPotLevel > 0 && STATE.filters.maxPotLevel > 0) {
        potLevelRangeDisplay.textContent = `${STATE.filters.minPotLevel} — ${STATE.filters.maxPotLevel}`;
      } else if (STATE.filters.minPotLevel > 0) {
        potLevelRangeDisplay.textContent = `${STATE.filters.minPotLevel}+`;
      } else if (STATE.filters.maxPotLevel > 0) {
        potLevelRangeDisplay.textContent = `До ${STATE.filters.maxPotLevel}`;
      } else {
        potLevelRangeDisplay.textContent = 'Любой';
      }
    }
    updateResetBadge();
    debounceSearch();
  }
  minPotLevelInput?.addEventListener('input', updatePotLevelFilter);
  maxPotLevelInput?.addEventListener('input', updatePotLevelFilter);

  // Game Chips Management
  const addGameInput = document.getElementById('addGameInput');
  const addGameBtn = document.getElementById('addGameBtn');
  const selectedGamesContainer = document.getElementById('selectedGamesContainer');

  function renderGameChips() {
    if (!selectedGamesContainer) return;
    selectedGamesContainer.innerHTML = STATE.filters.gameTitles.map(g => `
      <span class="game-tag-badge">
        <span>${escapeHtml(g)}</span>
        <button onclick="removeGameChip('${escapeHtml(g)}')">✕</button>
      </span>
    `).join('');
  }

  window.removeGameChip = function(game) {
    STATE.filters.gameTitles = STATE.filters.gameTitles.filter(x => x !== game);
    STATE.filters.page = 1;
    renderGameChips();
    updateResetBadge();
    debounceSearch();
  };

  addGameBtn?.addEventListener('click', () => {
    const val = addGameInput?.value.trim();
    if (val && !STATE.filters.gameTitles.includes(val)) {
      STATE.filters.gameTitles.push(val);
      STATE.filters.page = 1;
      if (addGameInput) addGameInput.value = '';
      renderGameChips();
      updateResetBadge();
      debounceSearch();
    }
  });

  renderGameChips();

  // Active Filter Pills
  document.querySelectorAll('.filter-pill .pill-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      const preset = pill?.dataset.preset;
      if (preset === 'diamond') STATE.filters.minScore = 0;
      if (preset === 'cs2') {
        STATE.filters.cs2Prime = false;
        if (cs2PrimeChk) cs2PrimeChk.checked = false;
        switchRowCs2?.classList.remove('active');
      }
      if (preset === 'aging6m') {
        STATE.filters.minDaybreak = 0;
        if (agingSlider) agingSlider.value = 0;
        if (agingVal) agingVal.textContent = '0d+';
      }
      pill?.remove();
      STATE.filters.page = 1;
      updateResetBadge();
      loadSingleListings();
    });
  });

  // Apply & Reset
  document.getElementById('applySidebarFiltersBtn')?.addEventListener('click', () => {
    const minP = document.getElementById('minPriceInput');
    const maxP = document.getElementById('maxPriceInput');
    if (minP) STATE.filters.minPrice = parseInt(minP.value, 10) || 0;
    if (maxP) STATE.filters.maxPrice = parseInt(maxP.value, 10) || 5000;
    if (minLevelInput) STATE.filters.minLevel = parseInt(minLevelInput.value, 10) || 0;
    if (maxLevelInput) STATE.filters.maxLevel = parseInt(maxLevelInput.value, 10) || 0;
    if (minPointsInput) STATE.filters.minPoints = parseInt(minPointsInput.value, 10) || 0;
    if (maxPointsInput) STATE.filters.maxPoints = parseInt(maxPointsInput.value, 10) || 0;
    if (minPotLevelInput) STATE.filters.minPotLevel = parseInt(minPotLevelInput.value, 10) || 0;
    if (maxPotLevelInput) STATE.filters.maxPotLevel = parseInt(maxPotLevelInput.value, 10) || 0;
    STATE.filters.page = 1;
    loadSingleListings();
  });

  document.getElementById('resetSidebarFiltersBtn')?.addEventListener('click', () => {
    STATE.filters.gameTitles = ['Counter-Strike 2'];
    STATE.filters.minPrice = 0;
    STATE.filters.maxPrice = 5000;
    STATE.filters.minDaybreak = 0;
    STATE.filters.maxHours2w = 100;
    STATE.filters.minLevel = 0;
    STATE.filters.maxLevel = 0;
    STATE.filters.minPoints = 0;
    STATE.filters.maxPoints = 0;
    STATE.filters.minPotLevel = 0;
    STATE.filters.maxPotLevel = 0;
    STATE.filters.minScore = 0;
    STATE.filters.emailType = 'any';
    STATE.filters.itemOrigin = 'any';
    STATE.filters.hidePhishing = false;
    STATE.filters.guarantee = 'any';
    STATE.filters.query = '';
    STATE.filters.cs2Prime = false;
    STATE.filters.noVac = false;
    STATE.filters.page = 1;

    if (quickSearch) quickSearch.value = '';
    if (agingSlider) agingSlider.value = 0;
    if (agingVal) agingVal.textContent = '0d+';
    if (activitySlider) activitySlider.value = 100;
    if (activityVal) activityVal.textContent = '<100h';
    if (minLevelInput) minLevelInput.value = '';
    if (maxLevelInput) maxLevelInput.value = '';
    if (levelRangeDisplay) levelRangeDisplay.textContent = 'Любой';
    if (minPointsInput) minPointsInput.value = '';
    if (maxPointsInput) maxPointsInput.value = '';
    if (pointsRangeDisplay) pointsRangeDisplay.textContent = 'Любые';
    if (minPotLevelInput) minPotLevelInput.value = '';
    if (maxPotLevelInput) maxPotLevelInput.value = '';
    if (potLevelRangeDisplay) potLevelRangeDisplay.textContent = 'Любой';
    if (cs2PrimeChk) cs2PrimeChk.checked = false;
    if (noVacChk) noVacChk.checked = false;
    if (hidePhishingChk) hidePhishingChk.checked = false;
    if (originSel) originSel.value = 'any';
    if (emailSel) emailSel.value = 'any';
    if (guarSel) guarSel.value = 'any';

    switchRowCs2?.classList.remove('active');
    switchRowVac?.classList.remove('active');
    switchRowHidePhishing?.classList.remove('active');

    renderGameChips();
    updateResetBadge();
    loadSingleListings();
  });
}

function updateResetBadge() {
  let count = 0;
  if (STATE.filters.minDaybreak > 0) count++;
  if (STATE.filters.maxHours2w < 100) count++;
  if (STATE.filters.minLevel > 0 || STATE.filters.maxLevel > 0) count++;
  if (STATE.filters.minPoints > 0 || STATE.filters.maxPoints > 0) count++;
  if (STATE.filters.minPotLevel > 0 || STATE.filters.maxPotLevel > 0) count++;
  if (STATE.filters.cs2Prime) count++;
  if (STATE.filters.noVac) count++;
  if (STATE.filters.hidePhishing) count++;
  if (STATE.filters.itemOrigin && STATE.filters.itemOrigin !== 'any') count++;
  if (STATE.filters.emailType && STATE.filters.emailType !== 'any') count++;
  if (STATE.filters.guarantee && STATE.filters.guarantee !== 'any') count++;
  if (STATE.filters.query) count++;
  if (STATE.filters.minScore > 0) count++;

  const badge = document.getElementById('resetCountBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  renderActiveChipsRibbon();
}

let searchDebounceTimer = null;
function debounceSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    STATE.filters.page = 1;
    loadSingleListings();
  }, 350);
}

// ==========================================================================
// DATA FETCHING & SINGLE SEARCH
// ==========================================================================
async function loadSingleListings() {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;

  // Shimmer Skeleton Loader
  grid.innerHTML = Array(4).fill(0).map(() => `
    <div class="lot-card" style="opacity: 0.6; min-height:240px; background: #FFFFFF;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="width:120px; height:28px; background:var(--neutral-200); border-radius:6px;"></div>
        <div style="width:50px; height:50px; border-radius:50%; background:var(--neutral-200);"></div>
      </div>
      <div style="width:80%; height:16px; background:var(--neutral-200); border-radius:4px; margin: 16px 0 8px 0;"></div>
      <div style="width:60%; height:14px; background:var(--neutral-200); border-radius:4px;"></div>
      <div style="display:flex; justify-content:space-between; margin-top:20px;">
        <div style="width:90px; height:20px; background:var(--neutral-200); border-radius:4px;"></div>
        <div style="width:70px; height:26px; background:var(--neutral-200); border-radius:6px;"></div>
      </div>
    </div>
  `).join('');

  try {
    const params = new URLSearchParams();
    
    // Game Titles
    if (STATE.filters.gameTitles && STATE.filters.gameTitles.length) {
      STATE.filters.gameTitles.forEach(g => params.append('game', g));
      params.append('game_titles', STATE.filters.gameTitles.join(','));
    }
    if (STATE.filters.gamesMatchMode) params.append('games_match_mode', STATE.filters.gamesMatchMode);

    // CS2 Prime Flag (CRITICAL: Strict check)
    if (STATE.filters.cs2Prime) {
      params.append('cs2_prime', '1');
    }
    if (STATE.filters.noVac) {
      params.append('no_vac', '1');
    }

    if (STATE.filters.minPrice > 0) params.append('min_price', STATE.filters.minPrice);
    if (STATE.filters.maxPrice > 0 && STATE.filters.maxPrice < 100000) params.append('max_price', STATE.filters.maxPrice);
    if (STATE.filters.minDaybreak > 0) params.append('min_daybreak', STATE.filters.minDaybreak);
    if (STATE.filters.maxHours2w < 100) {
      params.append('max_hours_2w', STATE.filters.maxHours2w);
      params.append('hours_2weeks', STATE.filters.maxHours2w);
    }
    // Scoring, Level & Points Filters
    if (STATE.filters.minScore > 0) params.append('min_score', STATE.filters.minScore);
    if (STATE.filters.minLevel > 0) {
      params.append('min_level', STATE.filters.minLevel);
      params.append('level_min', STATE.filters.minLevel);
    }
    if (STATE.filters.maxLevel > 0) {
      params.append('max_level', STATE.filters.maxLevel);
      params.append('level_max', STATE.filters.maxLevel);
    }
    if (STATE.filters.minPoints > 0) {
      params.append('min_points', STATE.filters.minPoints);
      params.append('points_min', STATE.filters.minPoints);
    }
    if (STATE.filters.maxPoints > 0) {
      params.append('max_points', STATE.filters.maxPoints);
      params.append('points_max', STATE.filters.maxPoints);
    }
    if (STATE.filters.minPotLevel > 0) {
      params.append('min_pot_level', STATE.filters.minPotLevel);
      params.append('min_potential_level', STATE.filters.minPotLevel);
    }
    if (STATE.filters.maxPotLevel > 0) {
      params.append('max_pot_level', STATE.filters.maxPotLevel);
      params.append('max_potential_level', STATE.filters.maxPotLevel);
    }

    // Email, Origin & Guarantee
    if (STATE.filters.emailType && STATE.filters.emailType !== 'any') params.append('email_type', STATE.filters.emailType);
    if (STATE.filters.itemOrigin && STATE.filters.itemOrigin !== 'any') {
      params.append('item_origin', STATE.filters.itemOrigin);
      params.append('origin', STATE.filters.itemOrigin);
    }
    if (STATE.filters.hidePhishing) {
      params.append('hide_phishing', '1');
    }
    if (STATE.filters.guarantee && STATE.filters.guarantee !== 'any') params.append('guarantee', STATE.filters.guarantee);

    // Text Query
    if (STATE.filters.query) {
      params.append('q', STATE.filters.query);
      params.append('title', STATE.filters.query);
    }

    // Sort mappings
    params.append('sort', STATE.filters.sortBy);
    params.append('sort_by', STATE.filters.sortBy);
    params.append('order_by', STATE.filters.sortBy);

    const currentPage = STATE.filters.page || 1;
    const perPage = 24;
    params.append('page', currentPage);
    params.append('limit', perPage);
    params.append('offset', (currentPage - 1) * perPage);

    const endpoint = STATE.searchSource === 'live' ? '/api/live_search' : '/api/db/search';
    const resp = await fetch(`${endpoint}?${params.toString()}`);
    const data = await resp.json();

    STATE.items = data.items || [];
    STATE.totalCount = data.total_matched || data.total_count || data.total || STATE.items.length;

    const counterTitle = document.getElementById('lotsCounterTitle');
    if (counterTitle) {
      const modeLabel = STATE.searchSource === 'live' ? '⚡ Live LZT' : '💾 SQLite База';
      counterTitle.innerHTML = `Найдено лотов: <strong>${STATE.totalCount.toLocaleString()}</strong> <span style="font-size:11px; color:var(--neutral-500); font-weight:500;">(${modeLabel})</span>`;
    }

    updateKPIs(STATE.items);
    renderCurrentItems();
    renderPagination(STATE.totalCount, currentPage, perPage);
  } catch (err) {
    console.error('Error fetching listings:', err);
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 48px; color: var(--accent-rose);">
      Не удалось загрузить данные. Проверьте запуск сервера.
    </div>`;
  }
}

function updateKPIs(items) {
  const avgPriceEl = document.getElementById('avgPriceVal');
  const topScoreEl = document.getElementById('topScoreVal');
  const totalCountEl = document.getElementById('totalListingsCount');
  const topBadgeEl = document.getElementById('topScoreBadge');
  const quantileFill = document.getElementById('quantileBarFill');

  if (items && items.length > 0) {
    const sum = items.reduce((acc, it) => acc + (it.rub_price || it.price || 0), 0);
    const avgRub = Math.round(sum / items.length);
    const bestScore = Math.max(...items.map(it => it.deal_score || 0));

    if (avgPriceEl) avgPriceEl.textContent = formatCurrency(avgRub);
    if (topScoreEl) topScoreEl.innerHTML = `${bestScore}<span class="num-unit">/100</span>`;
    if (quantileFill) quantileFill.style.width = `${bestScore}%`;
    if (topBadgeEl) {
      topBadgeEl.textContent = bestScore >= 85 ? 'EXCELLENT' : (bestScore >= 65 ? 'STRONG' : 'FAIR');
    }
  }

  if (totalCountEl && STATE.scannerStatus?.total_in_db) {
    totalCountEl.innerHTML = `${STATE.scannerStatus.total_in_db.toLocaleString()} <span class="num-unit-inline">лотов</span>`;
  }
}

function renderCurrentItems() {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;

  if (STATE.items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--neutral-600); background: #FFFFFF; border-radius: var(--radius-card); border: 1px solid var(--border-card); box-shadow: var(--shadow-card);">
        <div style="font-family: var(--font-tight); font-size: 17px; font-weight:700; color:var(--neutral-900); margin-bottom: 6px;">Лоты не найдены</div>
        <p style="font-size: 12.5px; color:var(--neutral-500); margin-bottom: 14px;">Слишком строгие фильтры — попробуйте снизить минимальный Deal Score или расширить отлёжку.</p>
        <button onclick="document.getElementById('resetSidebarFiltersBtn').click()" style="background:var(--neutral-900); color:#FFFFFF; border:none; padding:7px 16px; border-radius:var(--radius-input); font-weight:600; font-size:12px; cursor:pointer;">Сбросить фильтры</button>
      </div>
    `;
    return;
  }

  // First item with top score gets hero badge
  const highestScore = Math.max(...STATE.items.map(it => it.deal_score || 0));

  grid.innerHTML = STATE.items.map((it, idx) => {
    const isHero = idx === 0 && (it.deal_score || 0) === highestScore;
    return renderQuietLotCard(it, isHero, idx);
  }).join('');

  // Animate Apple Fitness Radial Rings
  requestAnimationFrame(() => {
    document.querySelectorAll('.score-ring-fill').forEach(ring => {
      const score = parseInt(ring.dataset.score || '50', 10);
      const circumference = 188.4;
      const offset = circumference - (circumference * score / 100);
      ring.style.strokeDashoffset = offset;
    });
  });
}

function formatLastActivityDate(item) {
  if (item.last_activity_str && item.last_activity_str !== 'Неизвестно') {
    return item.last_activity_str;
  }
  if (item.last_activity_ts && item.last_activity_ts > 0) {
    const d = new Date(item.last_activity_ts * 1000);
    const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${d.getUTCDate()} ${monthsRu[d.getUTCMonth()]} ${d.getUTCFullYear()} г.`;
  }
  if (item.daybreak !== undefined && item.daybreak !== null) {
    const days = parseInt(item.daybreak, 10);
    const ts = Date.now() - (days * 86400 * 1000);
    const d = new Date(ts);
    const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${d.getUTCDate()} ${monthsRu[d.getUTCMonth()]} ${d.getUTCFullYear()} г.`;
  }
  return 'Неизвестно';
}

function formatRegDate(item) {
  if (item.register_date_str && item.register_date_str !== 'Неизвестно') {
    return item.register_date_str;
  }
  if (item.register_date_ts && item.register_date_ts > 0) {
    const d = new Date(item.register_date_ts * 1000);
    const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `${d.getUTCDate()} ${monthsRu[d.getUTCMonth()]} ${d.getUTCFullYear()} г.`;
  }
  return 'Не указана';
}

function getAccountOriginMeta(item) {
  const rawOrigin = (item.item_origin || '').toLowerCase();
  const resaleOrigin = (item.resale_item_origin || '').toLowerCase();
  const phrase = (item.item_origin_phrase || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const isPersonal = item.is_personal_account || rawOrigin === 'personal' || phrase.includes('personal') || title.includes('личный') || title.includes('личн');
  const isReliable = Boolean(item.is_origin_reliable);

  if (isPersonal) {
    return {
      type: 'personal',
      badgeClass: 'origin-personal',
      label: '👤 Личный',
      description: 'Личный аккаунт владельца. Максимальная надежность (минимальный шанс реса).',
      riskTier: 'safe',
      riskText: 'Минимальный (Личный аккаунт)',
      icon: '👤'
    };
  }

  if (rawOrigin === 'fishing' || resaleOrigin === 'fishing' || phrase.includes('phishing') || phrase.includes('fishing') || title.includes('фишинг')) {
    const isResale = rawOrigin === 'resale' || resaleOrigin === 'fishing' || phrase.includes('resale');
    return {
      type: 'phishing',
      badgeClass: 'origin-phishing',
      label: isResale ? '🎣 Перепродажа (Фишинг)' : '🎣 Фишинг',
      description: 'Фишинг аккаунт! Высокий риск быстрого восстановления владельцем (особенно при низкой отлёжке).',
      riskTier: 'danger',
      riskText: 'КРИТИЧЕСКИЙ (Быстрое восстановление)',
      icon: '🎣'
    };
  }

  if (rawOrigin === 'stealer' || resaleOrigin === 'stealer' || phrase.includes('stealer') || title.includes('стиллер')) {
    const isResale = rawOrigin === 'resale' || resaleOrigin === 'stealer' || phrase.includes('resale');
    return {
      type: 'stealer',
      badgeClass: 'origin-stealer',
      label: isResale ? '🦹 Перепродажа (Стиллер)' : '🦹 Стиллер',
      description: 'Аккаунт добыт через стиллер. Средний риск восстановления.',
      riskTier: 'warn',
      riskText: 'Повышенный (Стиллер)',
      icon: '🦹'
    };
  }

  if (rawOrigin === 'autoreg' || phrase.includes('autoreg') || title.includes('авторег')) {
    return {
      type: 'autoreg',
      badgeClass: 'origin-autoreg',
      label: '🤖 Авторег',
      description: 'Автоматически зарегистрированный аккаунт. Риск восстановления нулевой.',
      riskTier: 'safe',
      riskText: 'Безопасно (Авторег)',
      icon: '🤖'
    };
  }

  if (rawOrigin === 'brute' || resaleOrigin === 'brute' || phrase.includes('brute') || title.includes('брут')) {
    return {
      type: 'brute',
      badgeClass: 'origin-brute',
      label: '🔓 Брут',
      description: 'Брутфорс / подбор пароля.',
      riskTier: 'warn',
      riskText: 'Средний (Брутфорс)',
      icon: '🔓'
    };
  }

  if (rawOrigin === 'resale' || phrase.includes('resale') || title.includes('перепродажа')) {
    return {
      type: 'resale',
      badgeClass: 'origin-resale',
      label: '🔄 Перепродажа',
      description: 'Перепроданный аккаунт. Оригинальный источник: ' + (item.item_origin_phrase || 'Не указан'),
      riskTier: 'neutral',
      riskText: 'Зависит от отлёжки',
      icon: '🔄'
    };
  }

  return {
    type: 'unknown',
    badgeClass: 'origin-unknown',
    label: item.item_origin_phrase || '📦 Происхождение',
    description: 'Происхождение: ' + (item.item_origin_phrase || 'Не указано'),
    riskTier: 'neutral',
    riskText: 'Стандартный риск',
    icon: '📦'
  };
}

function getAccountEmailMeta(item) {
  const rawType = (item.email_type || '').toLowerCase();
  const provider = (item.email_provider || '').toLowerCase();
  const domain = (item.item_domain || '').toLowerCase();
  const title = (item.title || '').toLowerCase();

  if (rawType === 'native' || title.includes('родная') || title.includes('родной') || title.includes('native')) {
    return {
      type: 'native',
      badgeClass: 'native',
      label: 'Родная почта',
      tooltip: `Родная почта владельца (${domain || provider || 'первая почта'})`
    };
  }

  if (rawType === 'autoreg' || provider === 'firstmail' || provider === 'rambler' || provider === 'notletters' || title.includes('авторег') || title.includes('autoreg')) {
    const pName = provider ? provider.toUpperCase() : (domain ? domain.toUpperCase() : 'AUTOREG');
    return {
      type: 'autoreg',
      badgeClass: 'autoreg',
      label: `Авторег (${pName})`,
      tooltip: `Авторег почта (${provider || domain})`
    };
  }

  if (rawType === 'temp' || rawType === 'market' || title.includes('времен')) {
    return {
      type: 'temp',
      badgeClass: 'temp',
      label: 'Временная маркет',
      tooltip: 'Временная почта маркета LZT'
    };
  }

  if (rawType === 'no' || title.includes('без почты')) {
    return {
      type: 'no',
      badgeClass: 'no-mail',
      label: 'Без почты',
      tooltip: 'Почта в комплекте отсутствует'
    };
  }

  if (domain || provider) {
    return {
      type: 'domain',
      badgeClass: 'autoreg',
      label: domain || provider,
      tooltip: `Домен почты: ${domain || provider}`
    };
  }

  return {
    type: 'temp',
    badgeClass: 'temp',
    label: 'Временная маркет',
    tooltip: 'Временная почта маркета LZT'
  };
}

// ==========================================================================
// QUIET PRECISION LOT CARD RENDERER (Radix Sand v2 Architecture)
// ==========================================================================
function renderQuietLotCard(item, isHero = false, index = 0) {
  const itemId = item.item_id || item.id;
  const rubPrice = item.rub_price || item.price || 455;
  const priceDisplay = formatCurrency(rubPrice);
  
  // Secondary Currency
  const secondaryPriceDisplay = STATE.currency === 'EUR' 
    ? `≈ ${rubPrice.toLocaleString()} ₽`
    : `≈ € ${(rubPrice / STATE.eurRubRate).toFixed(2)}`;

  const score = Math.round(item.deal_score || 85);
  const tierTitle = score >= 85 ? 'EXCELLENT' : (score >= 65 ? 'STRONG' : 'FAIR');

  const daybreak = item.daybreak || 0;
  const hours2w = (item.hours_2weeks !== undefined) ? item.hours_2weeks : 0;
  const cs2Hours = item.total_cs2_hours || item.hours_cs2 || 0;
  const activityLabel = hours2w === 0 ? '0.0h (2wks)' : `${hours2w}h (2wks)`;
  const lastActDate = formatLastActivityDate(item);
  const regDate = formatRegDate(item);

  // Multiplier ROI & Estimated Value (estimated_value in DB is in RUB)
  const rawEstRub = item.estimated_value || (item.estimated_library_value_eur ? item.estimated_library_value_eur * STATE.eurRubRate : 2500);
  const estRub = Math.round(rawEstRub);
  const estEur = Math.round((estRub / STATE.eurRubRate) * 10) / 10;
  const rawRatio = item.value_ratio || (estRub / Math.max(rubPrice, 1));
  const ratioStr = Math.max(1.1, parseFloat(rawRatio.toFixed(1)));

  // Steam Level & Potential Level
  const steamLvl = item.steam_level || 0;
  const steamPts = item.steam_points || 0;
  const potentialLvl = item.potential_level || steamLvl;

  // Games typographic list
  const extraGames = Array.isArray(item.extra_games) ? item.extra_games : [];
  const primaryGames = ['CS2', 'Rust', 'GTA V', 'DayZ', 'Dota 2', 'PUBG', 'Cyberpunk 2077'];
  const foundPrimary = primaryGames.filter(g => extraGames.some(eg => eg.toLowerCase().includes(g.toLowerCase())));
  
  let gamesDisplay = '';
  let fullGamesTitle = extraGames.join(', ');
  if (foundPrimary.length > 0) {
    const countRest = Math.max(0, extraGames.length - foundPrimary.length);
    gamesDisplay = foundPrimary.join(' · ') + (countRest > 0 ? ` · +${countRest} игр` : '');
  } else if (extraGames.length > 0) {
    gamesDisplay = extraGames.slice(0, 3).join(' · ') + (extraGames.length > 3 ? ` · +${extraGames.length - 3} игр` : '');
  } else {
    gamesDisplay = 'CS2 Prime · Steam Library';
  }

  // Ring stroke color
  const ringColor = score >= 85 ? '#4F46E5' : (score >= 65 ? '#10B981' : '#F59E0B');

  // Origin & Email Meta Classification
  const originMeta = getAccountOriginMeta(item);
  const emailMeta = getAccountEmailMeta(item);

  // Guarantee Label
  const guaranteeHours = item.guarantee_hours || 24;
  const isSafestGuar = guaranteeHours >= 72 || item.guarantee_type === 'safest';
  const guarLabel = isSafestGuar ? 'Личная (Safest)' : `${guaranteeHours}h Guar`;

  const isStarred = STATE.starredItems.has(itemId);
  const isCompared = STATE.comparedItems.has(itemId);

  return `
    <div class="lot-card ${isHero ? 'hero' : ''}" data-id="${itemId}" style="--card-index: ${index};">
      
      <!-- Top Card Star & Bookmark -->
      <div class="card-top-controls">
        <button class="btn-card-star ${isStarred ? 'active' : ''}" onclick="toggleStar(${itemId})" title="${isStarred ? 'В избранном' : 'Добавить в избранное'}">★</button>
      </div>

      <!-- Top Row: Dominant 32px Price & Apple Fitness 72px Score Ring -->
      <div class="card-top-row">
        <div class="card-price-col">
          <div class="card-price-group">
            <span class="card-price">${priceDisplay}</span>
            <span class="card-roi-badge">${ratioStr}× ROI</span>
          </div>
          <div class="card-price-secondary">${secondaryPriceDisplay} · Est. €${estEur}</div>
        </div>

        <!-- 72px Apple Fitness Radial Ring with Rich Telemetry Tooltip -->
        <div class="score-ring-wrap" title="Нажмите для спецификации лота #${itemId}">
          <svg class="score-ring-svg" viewBox="0 0 72 72">
            <defs>
              <linearGradient id="scoreGrad_${itemId}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4F46E5"></stop>
                <stop offset="100%" stop-color="#0D9488"></stop>
              </linearGradient>
            </defs>
            <circle class="score-ring-bg" cx="36" cy="36" r="30"></circle>
            <circle class="score-ring-fill" cx="36" cy="36" r="30" 
                    data-score="${score}"
                    stroke="${score >= 80 ? `url(#scoreGrad_${itemId})` : ringColor}"></circle>
          </svg>
          <div class="score-ring-text-center">
            <span class="score-number">${score}</span>
            <span class="score-sub-tier">${tierTitle}</span>
          </div>

          <!-- Rich Telemetry Breakdown Tooltip on Hover -->
          <div class="score-tooltip-box">
            <div class="st-header">
              <span class="st-score-pill">${score}/100</span>
              <span class="st-tier-title">${tierTitle} DEAL SCORE</span>
            </div>

            <div class="st-group">
              <div class="st-group-title">🏷️ ПРОИСХОЖДЕНИЕ И НАДЕЖНОСТЬ</div>
              <div class="st-row">
                <span class="st-label">Источник:</span>
                <span class="st-val ${originMeta.riskTier === 'danger' ? 'st-danger' : (originMeta.riskTier === 'safe' ? 'st-safe' : 'st-warn')}">${originMeta.label}</span>
              </div>
              <div class="st-row">
                <span class="st-label">Риск реса:</span>
                <span class="st-val ${originMeta.riskTier === 'danger' ? 'st-danger' : (originMeta.riskTier === 'safe' ? 'st-safe' : 'st-warn')}">${originMeta.riskText}</span>
              </div>
              <div class="st-row">
                <span class="st-label">Почта:</span>
                <span class="st-val">${emailMeta.label}</span>
              </div>
              <div class="st-row">
                <span class="st-label">Инфо LZT:</span>
                <span class="st-val ${item.is_origin_reliable ? 'st-safe' : 'st-warn'}">${item.is_origin_reliable ? '✓ Подтверждено' : 'Указано продавцом'}</span>
              </div>
            </div>
            
            <div class="st-group">
              <div class="st-group-title">🕒 АКТИВНОСТЬ И ВХОД</div>
              <div class="st-row">
                <span class="st-label">Посл. онлайн:</span>
                <span class="st-val st-highlight">${lastActDate} (${daybreak}д)</span>
              </div>
              <div class="st-row">
                <span class="st-label">За 2 недели:</span>
                <span class="st-val ${hours2w === 0 ? 'st-safe' : 'st-warn'}">
                  ${hours2w === 0 ? '0.0 ч (Чисто ✓)' : `${hours2w} ч (Активен ⚠️)`}
                </span>
              </div>
              <div class="st-row">
                <span class="st-label">Часы в CS2:</span>
                <span class="st-val">${cs2Hours > 0 ? `${cs2Hours} ч` : '0 ч'}</span>
              </div>
            </div>

            <div class="st-group">
              <div class="st-group-title">🛡️ БЕЗОПАСНОСТЬ И БАНЫ</div>
              <div class="st-row">
                <span class="st-label">VAC статус:</span>
                <span class="st-val ${!item.has_vac ? 'st-safe' : 'st-danger'}">
                  ${!item.has_vac ? '✓ Чисто' : '✕ БАН'}
                </span>
              </div>
              <div class="st-row">
                <span class="st-label">Trade / Comm:</span>
                <span class="st-val ${!item.has_trade_ban && !item.has_community_ban ? 'st-safe' : 'st-danger'}">
                  ${!item.has_trade_ban && !item.has_community_ban ? '✓ Чисто' : '✕ Ограничен'}
                </span>
              </div>
            </div>

            <div class="st-group">
              <div class="st-group-title">💎 ПРОКАЧКА И БАЛАНС</div>
              <div class="st-row">
                <span class="st-label">Steam Points:</span>
                <span class="st-val st-highlight">${steamPts.toLocaleString()} pts</span>
              </div>
              <div class="st-row">
                <span class="st-label">Потенциал:</span>
                <span class="st-val st-indigo">Lvl ${steamLvl} → ${potentialLvl} ⭐</span>
              </div>
            </div>

            <div class="st-footer">
              <span>ℹ️ Кликните на ℹ️ для полного досье</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2-Row Metadata Block (Technical Telemetry + Account Security & Origin) -->
      <div class="card-meta-block">
        
        <!-- Row 1: Technical (Dormant with Exact Date & 2-Week Playtime) -->
        <div class="card-meta-line">
          <div class="meta-item" title="Последний вход в аккаунт: ${lastActDate} (${daybreak} дн. назад)">
            <span class="meta-dot-status ${daybreak > 30 ? 'emerald' : ''}"></span>
            <span class="meta-val-text">${daybreak}d dormant</span>
          </div>
          <span class="meta-sep">|</span>
          <div class="meta-item" title="Сыграно за 2 недели: ${hours2w} ч (${hours2w === 0 ? 'Владелец оффлайн — безопасно' : 'Владелец недавно заходил!'})">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span class="meta-val-text ${hours2w > 0 ? 'text-amber font-600' : ''}">${activityLabel}</span>
          </div>
          <span class="meta-sep">|</span>
          <div class="meta-item" title="Гарантия: ${guarLabel}">
            <span>🛡️ ${guarLabel}</span>
          </div>
        </div>

        <!-- Row 2: Account Origin & Accurate Email & VAC Status -->
        <div class="card-meta-line">
          <span class="origin-badge ${originMeta.badgeClass}" title="${originMeta.description}">${originMeta.label}</span>
          <span class="meta-sep">|</span>
          <span class="email-badge ${emailMeta.badgeClass}" title="${emailMeta.tooltip}">✉ ${emailMeta.label}</span>
          <span class="meta-sep">|</span>
          <div class="meta-item" title="VAC: ${!item.has_vac ? 'Чисто' : 'БАН'} | Trade: ${!item.has_trade_ban ? 'Чисто' : 'БАН'} | Comm: ${!item.has_community_ban ? 'Чисто' : 'БАН'}">
            <span class="meta-val-text ${!item.has_vac ? '' : 'text-rose font-600'}">${!item.has_vac ? 'No VAC' : 'VAC Ban'}</span>
          </div>
        </div>

      </div>

      <!-- Games Line (With Hover Full Title) -->
      <div class="card-games-line" title="${escapeHtml(fullGamesTitle || item.title || '')}">
        <strong>${escapeHtml(gamesDisplay)}</strong>
      </div>

      <!-- Bottom Action Deck (With Inset Buttons) -->
      <div class="card-action-bottom">
        <div class="card-badges-group">
          ${item.cs2_prime ? '<span class="badge-tag-micro">CS2 Prime</span>' : ''}
          <span class="badge-tag-micro" title="Уровень: ${steamLvl} | Очков: ${steamPts.toLocaleString()} | Потенциал: Lvl ${potentialLvl}">Lvl ${steamLvl} (до ${potentialLvl} ⭐)</span>
        </div>

        <div class="card-btns-group">
          <button class="btn-card-action ${isCompared ? 'active' : ''}" onclick="toggleCompare(${itemId})" title="${isCompared ? 'Удалить из сравнения' : 'Сравнить лот'}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
            </svg>
          </button>
          <button class="btn-card-action" onclick="openDetailsModal(${itemId})" title="Спецификация и полное досье">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          <a href="https://lzt.market/${itemId}/" target="_blank" class="btn-card-buy" title="Купить на LZT Market">
            <span>Купить</span>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </a>
        </div>
      </div>

    </div>
  `;
}

// Star Bookmark Handler
window.toggleStar = function(itemId) {
  if (STATE.starredItems.has(itemId)) {
    STATE.starredItems.delete(itemId);
  } else {
    STATE.starredItems.add(itemId);
  }
  renderCurrentItems();
};

// ==========================================================================
// CO-OP BUNDLE MATCHER PRO CONTROLLER
// ==========================================================================
function initBundleControls() {
  // 1. Party Size Switcher (2, 3, 4 players)
  const partyButtons = document.querySelectorAll('.party-btn[data-party]');
  partyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      partyButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.bundleFilters.partySize = parseInt(btn.dataset.party, 10) || 2;
      loadBundleListings();
    });
  });

  // 2. Category Filter Pills
  const catButtons = document.querySelectorAll('.bundle-category-btn[data-cat]');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.bundleFilters.category = btn.dataset.cat || 'all';
      loadBundleListings();
    });
  });

  // 3. Source Switcher (Live API vs SQLite DB)
  const bundleSourceDbBtn = document.getElementById('bundleSourceDbBtn');
  const bundleSourceLiveBtn = document.getElementById('bundleSourceLiveBtn');

  bundleSourceDbBtn?.addEventListener('click', () => {
    STATE.bundleFilters.source = 'db';
    bundleSourceDbBtn.classList.add('active');
    bundleSourceLiveBtn?.classList.remove('active');
    loadBundleListings();
  });

  bundleSourceLiveBtn?.addEventListener('click', () => {
    STATE.bundleFilters.source = 'live';
    bundleSourceLiveBtn.classList.add('active');
    bundleSourceDbBtn?.classList.remove('active');
    loadBundleListings();
  });

  // 4. Budget Select
  const maxPriceSelect = document.getElementById('bundleMaxPriceSelect');
  maxPriceSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    STATE.bundleFilters.maxTotalPrice = (val === 'any') ? null : parseFloat(val);
    loadBundleListings();
  });

  // 5. Daybreak Select
  const daybreakSelect = document.getElementById('bundleDaybreakSelect');
  daybreakSelect?.addEventListener('change', (e) => {
    STATE.bundleFilters.minDaybreak = parseInt(e.target.value, 10) || 0;
    loadBundleListings();
  });

  // 6. Sort Select
  const sortSelect = document.getElementById('bundleSortSelect');
  sortSelect?.addEventListener('change', (e) => {
    STATE.bundleFilters.sortBy = e.target.value;
    loadBundleListings();
  });

  // 7. Quick Must-Have Game Chips
  const mustHaveChips = document.querySelectorAll('.must-game-chip[data-game]');
  mustHaveChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const gameName = chip.dataset.game;
      if (chip.classList.contains('active')) {
        if (!STATE.bundleFilters.mustHave.includes(gameName)) {
          STATE.bundleFilters.mustHave.push(gameName);
        }
      } else {
        STATE.bundleFilters.mustHave = STATE.bundleFilters.mustHave.filter(g => g !== gameName);
      }
      loadBundleListings();
    });
  });

  // 8. Refresh Button
  const refreshBtn = document.getElementById('bundleRefreshBtn');
  refreshBtn?.addEventListener('click', () => {
    loadBundleListings();
  });
}

async function loadBundleListings() {
  const grid = document.getElementById('bundleGrid');
  const resultCountEl = document.getElementById('bundleResultCount');
  const evaluatedCountEl = document.getElementById('bundleEvaluatedCount');
  if (!grid) return;

  // Shimmer Skeleton Loader for Bundles
  grid.innerHTML = Array(3).fill(0).map(() => `
    <div class="bundle-lot-card" style="opacity: 0.6; min-height: 260px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <div style="width:140px; height:26px; background:var(--neutral-200); border-radius:6px;"></div>
        <div style="width:100px; height:26px; background:var(--neutral-200); border-radius:6px;"></div>
      </div>
      <div style="width:70%; height:18px; background:var(--neutral-200); border-radius:4px; margin-bottom:16px;"></div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="height:120px; background:var(--neutral-100); border-radius:8px;"></div>
        <div style="height:120px; background:var(--neutral-100); border-radius:8px;"></div>
      </div>
    </div>
  `).join('');

  try {
    const params = new URLSearchParams();
    params.append('party_size', STATE.bundleFilters.partySize);
    params.append('category', STATE.bundleFilters.category);
    params.append('sort', STATE.bundleFilters.sortBy);
    params.append('source', STATE.bundleFilters.source);
    params.append('min_daybreak', STATE.bundleFilters.minDaybreak);
    params.append('limit', STATE.bundleFilters.limit);

    if (STATE.bundleFilters.maxTotalPrice) {
      params.append('max_total_price', STATE.bundleFilters.maxTotalPrice);
    }
    if (STATE.bundleFilters.mustHave && STATE.bundleFilters.mustHave.length) {
      STATE.bundleFilters.mustHave.forEach(g => params.append('must_have', g));
    }

    const resp = await fetch(`/api/bundle/search?${params.toString()}`);
    const data = await resp.json();
    const bundles = data.bundles || [];
    STATE.bundles = bundles;

    if (resultCountEl) {
      resultCountEl.innerHTML = `Найдено связок: <strong>${(data.total_bundles || bundles.length).toLocaleString()}</strong>`;
    }
    if (evaluatedCountEl) {
      evaluatedCountEl.innerHTML = `Оценено лотов: <strong>${(data.candidates_evaluated || 0).toLocaleString()}</strong>`;
    }

    if (bundles.length === 0) {
      grid.innerHTML = `
        <div class="bundle-empty-state">
          <div class="bundle-empty-icon">🔍</div>
          <div class="bundle-empty-title">Кооп-связки не найдены</div>
          <p class="bundle-empty-desc">
            По текущим критериям (${STATE.bundleFilters.partySize} игрока, категория "${STATE.bundleFilters.category}") нет подходящих комбинаций лотов.<br>
            Попробуйте снять ограничение по бюджету, выбрать другую категорию или переключить источник на Live API.
          </p>
          <button class="btn-bundle-empty-reset" onclick="resetBundleFilters()">Сбросить фильтры связок</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = bundles.map((b, idx) => renderBundleCard(b, idx)).join('');

  } catch (err) {
    console.error('Error fetching bundles:', err);
    grid.innerHTML = `
      <div class="bundle-empty-state">
        <div class="bundle-empty-icon">⚠️</div>
        <div class="bundle-empty-title">Ошибка при подборе связок</div>
        <p class="bundle-empty-desc">${escapeHtml(err.message || 'Сервер не отвечает')}</p>
        <button class="btn-bundle-empty-reset" onclick="loadBundleListings()">Повторить попытку</button>
      </div>
    `;
  }
}

function renderBundleCard(b, idx) {
  const isTopRank = b.rank === 1;
  const sharedGames = b.shared_games || [];
  const accounts = b.accounts || [];
  const partySize = b.party_size || accounts.length || 2;
  const totalPrice = b.total_price || 0;
  const pricePerPlayer = b.price_per_player || (totalPrice / partySize);
  const bundleScore = b.bundle_score || 85;

  return `
    <div class="bundle-lot-card ${isTopRank ? 'top-rank' : ''}">
      
      <!-- Card Top Header -->
      <div class="bundle-card-header">
        <div class="bundle-rank-badge-wrap">
          <span class="bundle-rank-pill ${isTopRank ? 'rank-gold' : ''}">
            ${isTopRank ? '🏆 #1 ТОП СВЯЗКА' : `#${b.rank} СВЯЗКА`}
          </span>
          <span class="bundle-score-tag ${bundleScore >= 90 ? 'score-elite' : ''}">
            ⚡ ${bundleScore}/100 Synergy
          </span>
        </div>

        <div class="bundle-pricing-deck">
          <div class="bundle-total-price">${formatCurrency(totalPrice)}</div>
          <div class="bundle-per-player-price">≈ ${formatCurrency(pricePerPlayer)} / чел.</div>
        </div>
      </div>

      <!-- Shared Games Ribbon -->
      <div class="bundle-shared-deck">
        <div class="bundle-shared-title-row">
          <span class="bundle-shared-label">🎮 ОБЩИЕ ИГРЫ (${b.shared_games_count || sharedGames.length}):</span>
          <span class="bundle-shared-stats">${b.shared_paid_count || sharedGames.length} платных · 100% совпадение</span>
        </div>
        <div class="bundle-games-chips-wrap">
          ${sharedGames.map(game => `
            <span class="bundle-game-pill" title="Доступно на всех ${partySize} аккаунтах">
              <span class="game-pill-check">✓</span>
              <span>${escapeHtml(game)}</span>
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Accounts Subgrid (2, 3, or 4 accounts side-by-side) -->
      <div class="bundle-accounts-subgrid" style="grid-template-columns: repeat(${Math.min(partySize, 4)}, 1fr);">
        ${accounts.map((acc, accIdx) => {
          const accPrice = acc.price || 0;
          const daybreak = acc.daybreak || 0;
          const steamLvl = acc.steam_level || 0;
          const steamPts = acc.steam_points || 0;
          const bonusGames = acc.exclusive_games || [];

          return `
            <div class="bundle-sub-account-card">
              <div class="sub-acc-header">
                <div class="sub-acc-player-num">👤 Игрок #${accIdx + 1}</div>
                <div class="sub-acc-price">${formatCurrency(accPrice)}</div>
              </div>

              <div class="sub-acc-title" title="${escapeHtml(acc.title || '')}">
                ${escapeHtml(acc.title || 'Steam Account')}
              </div>

              <div class="sub-acc-meta-tags">
                <span class="sub-meta-pill ${daybreak >= 30 ? 'safe' : ''}">⏳ ${daybreak}д отлёжка</span>
                <span class="sub-meta-pill">⭐ Lvl ${steamLvl}</span>
                ${steamPts > 0 ? `<span class="sub-meta-pill points">💎 ${steamPts.toLocaleString()}</span>` : ''}
                ${acc.cs2_prime ? `<span class="sub-meta-pill prime">CS2 Prime</span>` : ''}
                <span class="sub-meta-pill">🛡️ ${acc.guarantee_hours || 24}ч</span>
              </div>

              ${bonusGames.length > 0 ? `
                <div class="sub-acc-bonus" title="Дополнительные игры только на этом аккаунте: ${bonusGames.join(', ')}">
                  <span class="bonus-label">🎁 Бонус:</span>
                  <span class="bonus-games-text">${escapeHtml(bonusGames.slice(0, 2).join(', '))}${bonusGames.length > 2 ? ` +${bonusGames.length - 2}` : ''}</span>
                </div>
              ` : `
                <div class="sub-acc-bonus-empty">
                  <span>Чистый набор для коопа</span>
                </div>
              `}

              <div class="sub-acc-footer">
                <div class="sub-acc-seller" title="Продавец: ${escapeHtml(acc.seller_name || 'Market')}">
                  <span>🏪 ${escapeHtml(acc.seller_name || 'Market')}</span>
                </div>
                <a href="${acc.direct_url || `https://lzt.market/${acc.item_id}/`}" target="_blank" class="sub-acc-btn-buy" title="Купить этот аккаунт на LZT Market">
                  <span>Купить #${acc.item_id} ↗</span>
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

window.resetBundleFilters = function() {
  STATE.bundleFilters.partySize = 2;
  STATE.bundleFilters.category = 'all';
  STATE.bundleFilters.maxTotalPrice = null;
  STATE.bundleFilters.minDaybreak = 0;
  STATE.bundleFilters.sortBy = 'shared_games';
  STATE.bundleFilters.mustHave = [];

  // Reset UI elements
  document.querySelectorAll('.party-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('.bundle-category-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('.must-game-chip').forEach(b => b.classList.remove('active'));
  
  const maxPriceSelect = document.getElementById('bundleMaxPriceSelect');
  if (maxPriceSelect) maxPriceSelect.value = 'any';

  const daybreakSelect = document.getElementById('bundleDaybreakSelect');
  if (daybreakSelect) daybreakSelect.value = '0';

  const sortSelect = document.getElementById('bundleSortSelect');
  if (sortSelect) sortSelect.value = 'shared_games';

  loadBundleListings();
};

// ==========================================================================
// REAL-TIME SCANNER & HARVESTER
// ==========================================================================
function initScannerControls() {
  const btnStartHarv = document.getElementById('btnStartHarvester');
  const btnStartSnip = document.getElementById('btnStartSniper');
  const btnStop = document.getElementById('btnStopIndexer');

  btnStartHarv?.addEventListener('click', async () => {
    appendLog('Запуск фонового харвестера рынка...', 'info');
    await fetch('/api/indexer/start_targeted', { method: 'POST' });
  });

  btnStartSnip?.addEventListener('click', async () => {
    appendLog('Активация режима Realtime Sniper...', 'warn');
    await fetch('/api/indexer/start_sniper', { method: 'POST' });
  });

  btnStop?.addEventListener('click', async () => {
    appendLog('Остановка индексатора...', 'info');
    await fetch('/api/indexer/stop', { method: 'POST' });
  });
}

function startScannerPolling() {
  setInterval(async () => {
    try {
      const resp = await fetch('/api/indexer/status');
      const status = await resp.json();
      STATE.scannerStatus = status;

      const speedEl = document.getElementById('scanSpeedVal');
      const sessEl = document.getElementById('scanSessionVal');
      const totalDbEl = document.getElementById('scanTotalDbVal');
      const kpiSpeedText = document.getElementById('kpiSpeedText');

      if (speedEl) speedEl.textContent = `${(status.speed_items_sec || 0).toFixed(1)} items/s`;
      if (sessEl) sessEl.textContent = (status.total_items_indexed || 0).toLocaleString();
      if (totalDbEl) totalDbEl.textContent = (status.total_in_db || 0).toLocaleString();
      if (kpiSpeedText) kpiSpeedText.textContent = `${(status.speed_items_sec || 0).toFixed(1)}/s`;

    } catch (e) {
      // Ignore background errors
    }
  }, 2500);
}

function appendLog(msg, type = 'info') {
  const consoleEl = document.getElementById('scannerLogConsole');
  if (!consoleEl) return;
  const time = new Date().toLocaleTimeString();
  const div = document.createElement('div');
  div.className = `log-row ${type}`;
  div.textContent = `[${time}] ${msg}`;
  consoleEl.appendChild(div);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

// ==========================================================================
// MODALS & SPECIFICATION DOSSIER
// ==========================================================================
function initModals() {
  const detailModal = document.getElementById('detailModal');
  const closeDetailBtn = document.getElementById('modalCloseBtn');
  
  const compareModal = document.getElementById('compareModalOverlay');
  const closeCompareBtn = document.getElementById('compareModalCloseBtn');
  const headerCompareBtn = document.getElementById('headerCompareBtn');
  const findBestJuiceBtn = document.getElementById('findBestJuiceBtn');
  const sidebarBestJuiceBtn = document.getElementById('sidebarBestJuiceBtn');

  closeDetailBtn?.addEventListener('click', () => detailModal?.classList.remove('open'));
  closeCompareBtn?.addEventListener('click', () => compareModal?.classList.remove('open'));
  
  headerCompareBtn?.addEventListener('click', () => {
    openComparisonModal();
  });

  findBestJuiceBtn?.addEventListener('click', () => {
    findBestJuiceAndRankAll();
  });

  sidebarBestJuiceBtn?.addEventListener('click', () => {
    findBestJuiceAndRankAll();
  });

  window.addEventListener('click', (e) => {
    if (e.target === detailModal) detailModal?.classList.remove('open');
    if (e.target === compareModal) compareModal?.classList.remove('open');
  });
}

window.filterModalGames = function(query) {
  const q = (query || '').toLowerCase().trim();
  const chips = document.querySelectorAll('#specModalGamesBox .spec-game-chip');
  chips.forEach(chip => {
    const name = chip.getAttribute('data-name') || '';
    if (!q || name.includes(q)) {
      chip.style.display = 'inline-flex';
    } else {
      chip.style.display = 'none';
    }
  });
};

window.openDetailsModal = function(itemId) {
  const item = STATE.items.find(x => (x.item_id || x.id) == itemId);
  if (!item) return;

  const modal = document.getElementById('detailModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  const score = Math.round(item.deal_score || 85);
  const tierTitle = score >= 85 ? 'EXCELLENT' : (score >= 65 ? 'STRONG' : 'FAIR');
  const rubPrice = item.rub_price || item.price || 455;
  const priceDisplay = formatCurrency(rubPrice);
  const secondaryPriceDisplay = STATE.currency === 'EUR' 
    ? `≈ ${rubPrice.toLocaleString()} ₽`
    : `≈ € ${(rubPrice / STATE.eurRubRate).toFixed(2)}`;

  const daybreak = item.daybreak || 0;
  const hours2w = (item.hours_2weeks !== undefined) ? item.hours_2weeks : 0;
  const cs2Hours = item.total_cs2_hours || item.hours_cs2 || 0;
  const lastActDate = formatLastActivityDate(item);
  const regDate = formatRegDate(item);

  const steamLvl = item.steam_level || 0;
  const steamPts = item.steam_points || 0;
  const potentialLvl = item.potential_level || steamLvl;
  const addedLvls = Math.max(0, potentialLvl - steamLvl);

  // Multiplier ROI & Estimated Value (estimated_value in DB is in RUB)
  const rawEstRub = item.estimated_value || (item.estimated_library_value_eur ? item.estimated_library_value_eur * STATE.eurRubRate : 2500);
  const estRub = Math.round(rawEstRub);
  const estEur = Math.round((estRub / STATE.eurRubRate) * 10) / 10;
  const rawRatio = item.value_ratio || (estRub / Math.max(rubPrice, 1));
  const ratioStr = Math.max(1.1, parseFloat(rawRatio.toFixed(1)));

  const originMeta = getAccountOriginMeta(item);
  const emailMeta = getAccountEmailMeta(item);

  const guaranteeHours = item.guarantee_hours || 24;
  const isSafestGuar = guaranteeHours >= 72 || item.guarantee_type === 'safest';
  const guarLabel = isSafestGuar ? 'Личный аккаунт (Safest)' : `${guaranteeHours} часов гарантии`;

  const extraGames = Array.isArray(item.extra_games) ? item.extra_games : [];

  body.innerHTML = `
    <div class="spec-modal-container">
      
      <!-- Top Header Deck -->
      <div class="spec-modal-header">
        <div class="spec-header-left">
          <div class="spec-price-title-row">
            <span class="spec-price-main">${priceDisplay}</span>
            <span class="spec-price-sub">${secondaryPriceDisplay}</span>
            <span class="spec-roi-pill">${ratioStr}× ROI</span>
            <span class="origin-badge ${originMeta.badgeClass}">${originMeta.label}</span>
            ${item.cs2_prime ? '<span class="spec-prime-pill">CS2 Prime</span>' : ''}
          </div>
          <div class="spec-account-title">${escapeHtml(item.title || 'Steam Account')}</div>
        </div>

        <div class="spec-header-right">
          <div class="spec-score-card">
            <div class="spec-score-ring-val">${score}</div>
            <div class="spec-score-info">
              <div class="spec-score-tier">${tierTitle}</div>
              <div class="spec-score-lbl">DEAL SCORE</div>
            </div>
          </div>
        </div>
      </div>

      ${originMeta.type === 'phishing' ? `
        <div style="margin-bottom: 16px; padding: 10px 14px; background: rgba(225, 29, 72, 0.08); border: 1px solid rgba(225, 29, 72, 0.3); border-radius: 8px; font-size: 12px; color: var(--accent-rose); display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">⚠️</span>
          <div>
            <strong>Внимание (Фишинг):</strong> Аккаунт получен путем фишинга. Риск быстрого восстановления исходным владельцем максимален (особенно при отлёжке менее 30 дней).
          </div>
        </div>
      ` : ''}

      <!-- 4-Grid Dossier Layout -->
      <div class="spec-dossier-grid">
        
        <!-- Box 1: 🕒 Активность и Вход владельца -->
        <div class="spec-bento-card">
          <div class="spec-card-heading">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>АКТИВНОСТЬ & ВХОД ВЛАДЕЛЬЦА</span>
          </div>
          <div class="spec-rows-list">
            <div class="spec-field-row">
              <span class="spec-field-k">Последний онлайн:</span>
              <span class="spec-field-v font-600">${lastActDate} <span class="spec-mini-tag">${daybreak} дн. назад</span></span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Сыграно за 2 недели:</span>
              <span class="spec-field-v ${hours2w === 0 ? 'text-emerald font-600' : 'text-amber font-600'}">
                ${hours2w === 0 ? '0.0 ч (Владелец оффлайн ✓)' : `${hours2w} ч (Недавний вход ⚠️)`}
              </span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Общие часы в CS2:</span>
              <span class="spec-field-v font-600">${cs2Hours > 0 ? `${cs2Hours} часов` : '0 часов'}</span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Дата регистрации:</span>
              <span class="spec-field-v">${regDate}</span>
            </div>
          </div>
        </div>

        <!-- Box 2: 🛡️ Происхождение, Почта и Статус банов -->
        <div class="spec-bento-card">
          <div class="spec-card-heading">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>ПРОИСХОЖДЕНИЕ & БЕЗОПАСНОСТЬ</span>
          </div>
          <div class="spec-rows-list">
            <div class="spec-field-row">
              <span class="spec-field-k">Происхождение:</span>
              <span class="spec-field-v">
                <span class="origin-badge ${originMeta.badgeClass}">${originMeta.label}</span>
                ${item.resale_item_origin ? `<span style="font-size:10.5px; color:var(--neutral-500);"> (было: ${item.resale_item_origin})</span>` : ''}
              </span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Надежность инфо:</span>
              <span class="spec-field-v ${item.is_origin_reliable ? 'text-emerald font-600' : 'text-amber'}">
                ${item.is_origin_reliable ? '✓ Подтверждено LZT' : 'Указано продавцом'}
              </span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Комплект почты:</span>
              <span class="spec-field-v">
                <span class="email-badge ${emailMeta.badgeClass}">✉ ${emailMeta.label}</span>
                ${item.item_domain ? `<span style="font-size:10.5px; color:var(--neutral-500);"> (${item.item_domain})</span>` : ''}
              </span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">VAC & Баны:</span>
              <span class="spec-field-v ${!item.has_vac && !item.has_trade_ban ? 'text-emerald font-600' : 'text-rose font-600'}">
                ${!item.has_vac ? '✓ Чисто (Без блокировок)' : '✕ ОБНАРУЖЕН VAC БАН'}
              </span>
            </div>
          </div>
        </div>

        <!-- Box 3: 💎 Прокачка Steam и Очки -->
        <div class="spec-bento-card">
          <div class="spec-card-heading">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>ПРОКАЧКА & БАЛАНС STEAM</span>
          </div>
          <div class="spec-rows-list">
            <div class="spec-field-row">
              <span class="spec-field-k">Текущий уровень:</span>
              <span class="spec-field-v font-600">Level ${steamLvl}</span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Баланс Steam Points:</span>
              <span class="spec-field-v font-600 text-indigo">${steamPts.toLocaleString()} pts</span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Потенциальный уровень:</span>
              <span class="spec-field-v font-600 text-indigo">Lvl ${potentialLvl} (+${addedLvls} уровней)</span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Оценка библиотеки:</span>
              <span class="spec-field-v">≈ ${estRub.toLocaleString()} ₽ (€ ${estEur})</span>
            </div>
          </div>
        </div>

        <!-- Box 4: 👤 Информация о продавце -->
        <div class="spec-bento-card">
          <div class="spec-card-heading">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>ЛОТ И ПРОДАВЕЦ</span>
          </div>
          <div class="spec-rows-list">
            <div class="spec-field-row">
              <span class="spec-field-k">Продавец:</span>
              <span class="spec-field-v font-600">${escapeHtml(item.seller_name || 'LZT Seller')} ${item.seller_id ? `(#${item.seller_id})` : ''}</span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">ID объявления:</span>
              <span class="spec-field-v">#${itemId}</span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Регион & Валюта:</span>
              <span class="spec-field-v">${item.steam_country || 'Global'} / ${item.steam_currency || 'RUB'}</span>
            </div>
            <div class="spec-field-row">
              <span class="spec-field-k">Категория:</span>
              <span class="spec-field-v">Steam Market</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Full Games Library Deck -->
      <div class="spec-games-section">
        <div class="spec-games-header">
          <div class="spec-games-title">
            <span>🎮 БИБЛИОТЕКА ИГР (${extraGames.length > 0 ? `${extraGames.length} найдено` : 'Основной набор'})</span>
          </div>
          <input type="text" class="spec-games-filter-input" id="specGameFilterInput" placeholder="Поиск игры по названию..." oninput="filterModalGames(this.value)">
        </div>
        <div class="spec-games-tags-box" id="specModalGamesBox">
          ${(extraGames.length > 0 ? extraGames : ['Counter-Strike 2 (Prime Status)', 'Steam Community']).map(g => `
            <span class="spec-game-chip" data-name="${escapeHtml(g).toLowerCase()}">
              <span class="chip-dot"></span>
              ${escapeHtml(g)}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Bottom CTA Deck -->
      <div class="spec-bottom-bar">
        <div class="spec-bottom-actions">
          <button class="spec-btn-secondary" onclick="toggleCompare(${itemId})">
            ${STATE.comparedItems.has(itemId) ? '✓ В сравнении' : '⚖ Добавить в сравнение'}
          </button>
          <button class="spec-btn-secondary" onclick="toggleStar(${itemId})">
            ${STATE.starredItems.has(itemId) ? '★ В избранном' : '☆ В избранное'}
          </button>
        </div>
        <a href="https://lzt.market/${itemId}/" target="_blank" class="spec-btn-buy">
          <span>Купить на LZT Market</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
      </div>

    </div>
  `;

  modal.classList.add('open');
};

window.toggleCompare = function(itemId) {
  const item = STATE.items.find(x => (x.item_id || x.id) == itemId);
  if (!item) return;

  if (STATE.comparedItems.has(itemId)) {
    STATE.comparedItems.delete(itemId);
  } else {
    if (STATE.comparedItems.size >= 6) {
      alert('Максимум 6 лотов для одновременного сравнения.');
      return;
    }
    STATE.comparedItems.set(itemId, item);
  }

  updateCompareBadge();
  updateCompareFloatingBar();
  renderCurrentItems();

  const modal = document.getElementById('compareModalOverlay');
  if (modal && modal.classList.contains('open')) {
    renderCompareModal();
  }
};

window.openComparisonModal = function() {
  if (STATE.comparedItems.size === 0) {
    alert('Добавьте хотя бы 1–2 аккаунта в сравнение (нажмите ⚖ на карточке лота)');
    return;
  }
  renderCompareModal();
};

window.clearComparedItems = function() {
  STATE.comparedItems.clear();
  updateCompareBadge();
  updateCompareFloatingBar();
  renderCurrentItems();
  const modal = document.getElementById('compareModalOverlay');
  if (modal) modal.classList.remove('open');
};

function updateCompareBadge() {
  const badge = document.getElementById('compareCountBadge');
  if (badge) {
    badge.textContent = STATE.comparedItems.size;
  }
}

function updateCompareFloatingBar() {
  const bar = document.getElementById('compareFloatingBar');
  const text = document.getElementById('compareFloatingText');
  const chips = document.getElementById('compareFloatingChips');
  if (!bar) return;

  const count = STATE.comparedItems.size;
  if (count === 0) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';
  if (text) {
    text.innerHTML = `В сравнении: <strong>${count}</strong> ${count === 1 ? 'аккаунт' : (count < 5 ? 'аккаунта' : 'аккаунтов')}`;
  }

  if (chips) {
    chips.innerHTML = Array.from(STATE.comparedItems.values()).map(it => {
      const p = formatCurrency(it.rub_price || it.price);
      return `<span class="compare-floating-chip">${p} · #${it.item_id || it.id}</span>`;
    }).join('');
  }
}

function analyzeAndRankComparedAccounts(items) {
  if (!items || items.length === 0) return [];

  const prices = items.map(it => Number(it.rub_price || it.price || 0)).filter(p => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 1;
  const maxPrice = prices.length ? Math.max(...prices) : 1;

  const daybreaks = items.map(it => Number(it.daybreak || 0));
  const maxDaybreak = Math.max(0, ...daybreaks);

  const pointsList = items.map(it => Number(it.steam_points || 0));
  const maxPoints = Math.max(0, ...pointsList);

  const potLvls = items.map(it => Number(it.potential_level || it.steam_level || 0));
  const maxPotLvl = Math.max(0, ...potLvls);

  const cs2HoursList = items.map(it => Number(it.total_cs2_hours || it.hours_cs2 || 0));
  const maxCs2Hours = Math.max(0, ...cs2HoursList);

  const analyzed = items.map(it => {
    const price = Number(it.rub_price || it.price || 0);
    const daybreak = Number(it.daybreak || 0);
    const hours2w = Number(it.hours_2weeks !== undefined ? it.hours_2weeks : 0);
    const points = Number(it.steam_points || 0);
    const lvl = Number(it.steam_level || 0);
    const potLvl = Number(it.potential_level || lvl);
    const cs2Hours = Number(it.total_cs2_hours || it.hours_cs2 || 0);
    const hasPrime = Boolean(it.cs2_prime);
    const hasVac = Boolean(it.has_vac);
    const originMeta = getAccountOriginMeta(it);
    const emailMeta = getAccountEmailMeta(it);

    // 1. Safety Factor (0..100)
    let daybreakScore = 15;
    if (daybreak >= 120) daybreakScore = 100;
    else if (daybreak >= 90) daybreakScore = 95;
    else if (daybreak >= 60) daybreakScore = 85;
    else if (daybreak >= 30) daybreakScore = 70;
    else if (daybreak >= 14) daybreakScore = 50;
    else if (daybreak >= 5) daybreakScore = 30;

    let hours2wScore = 100;
    if (hours2w > 10) hours2wScore = 10;
    else if (hours2w > 3) hours2wScore = 35;
    else if (hours2w > 0) hours2wScore = 65;

    let originScore = 70;
    if (originMeta.riskTier === 'safe') originScore = 100;
    else if (originMeta.riskTier === 'danger') originScore = 30;

    let emailScore = (emailMeta.badgeClass === 'native') ? 95 : 75;

    let safetyScore = Math.round(daybreakScore * 0.45 + hours2wScore * 0.30 + originScore * 0.15 + emailScore * 0.10);
    if (hasVac) safetyScore = 5;

    // 2. Value & Profile Perks Factor (0..100)
    let pointsScore = 20;
    if (points >= 50000) pointsScore = 100;
    else if (points >= 30000) pointsScore = 90;
    else if (points >= 15000) pointsScore = 75;
    else if (points >= 5000) pointsScore = 55;
    else if (points >= 1000) pointsScore = 40;

    let potLvlScore = 30;
    if (potLvl >= 30) potLvlScore = 100;
    else if (potLvl >= 25) potLvlScore = 90;
    else if (potLvl >= 20) potLvlScore = 80;
    else if (potLvl >= 15) potLvlScore = 65;
    else if (potLvl >= 10) potLvlScore = 50;

    let priceScore = maxPrice === minPrice ? 85 : Math.round(((maxPrice - price) / (maxPrice - minPrice || 1)) * 40 + 60);

    let valueScore = Math.round(pointsScore * 0.40 + potLvlScore * 0.35 + priceScore * 0.25);

    // 3. Content & Library Factor (0..100)
    let cs2Score = hasPrime ? 60 : 20;
    if (cs2Hours >= 500) cs2Score += 35;
    else if (cs2Hours >= 100) cs2Score += 25;
    else if (cs2Hours >= 20) cs2Score += 15;
    else if (cs2Hours > 0) cs2Score += 10;
    let contentScore = Math.min(100, cs2Score);

    // Overall Advisor Score
    let advisorScore = Math.round(safetyScore * 0.40 + valueScore * 0.35 + contentScore * 0.25);

    // Dynamic Pros & Cons Generator
    const pros = [];
    const cons = [];

    if (daybreak >= 60) pros.push(`🛡️ Отлежка ${daybreak} дн — шанс реса минимален`);
    else if (daybreak >= 20) pros.push(`🕒 Отлежка ${daybreak} дн`);
    else cons.push(`⚠️ Отлежка всего ${daybreak} дн — риск восстановления`);

    if (hours2w === 0) pros.push(`⚡ 0.0ч за 2 недели — полный неактив`);
    else cons.push(`⚠️ ${hours2w}ч за 2 недели — недавняя активность`);

    if (points >= 20000) pros.push(`💎 ${points.toLocaleString()} очков Steam (ап до ${potLvl} Lvl + витрины)`);
    else if (points >= 5000) pros.push(`🪙 ${points.toLocaleString()} очков Steam`);

    if (price === minPrice && items.length > 1) pros.push(`💰 Лучшая цена в подборке (${formatCurrency(price)})`);

    if (originMeta.riskTier === 'safe') pros.push(`👑 Безопасное происхождение (${originMeta.label})`);
    else if (originMeta.riskTier === 'danger') cons.push(`⚠️ Риск: ${originMeta.label}`);

    if (hasVac) cons.push(`🚫 Обнаружен VAC BAN`);

    return {
      item: it,
      price,
      daybreak,
      hours2w,
      points,
      lvl,
      potLvl,
      cs2Hours,
      hasPrime,
      hasVac,
      originMeta,
      emailMeta,
      safetyScore,
      valueScore,
      contentScore,
      advisorScore,
      pros,
      cons,
      isMinPrice: price === minPrice && items.length > 1,
      isMaxDaybreak: daybreak === maxDaybreak && maxDaybreak > 0 && items.length > 1,
      isMaxPoints: points === maxPoints && maxPoints > 0 && items.length > 1,
      isMaxPotLvl: potLvl === maxPotLvl && maxPotLvl > 0 && items.length > 1,
      isMaxCs2Hours: cs2Hours === maxCs2Hours && maxCs2Hours > 0 && items.length > 1
    };
  });

  // Sort descending by Advisor Score
  analyzed.sort((a, b) => b.advisorScore - a.advisorScore);

  return analyzed;
}

let LAST_JUICE_RANKED = [];
let LAST_JUICE_TOTAL_COUNT = 0;
let CURRENT_LEADERBOARD_TAB = 'all';

window.findBestJuiceAndRankAll = async function() {
  const modal = document.getElementById('compareModalOverlay');
  const body = document.getElementById('compareModalBody');
  const tag = document.getElementById('modalCompareCountTag');
  if (!modal || !body) return;

  // Show loading indicator
  if (tag) tag.textContent = 'ИИ Анализ базы...';
  body.innerHTML = `
    <div style="text-align:center; padding: 48px 20px;">
      <div style="font-size:36px; margin-bottom:12px; animation: sparkleGlow 1.5s infinite ease-in-out;">🤖 ✨</div>
      <div style="font-family:var(--font-tight); font-size:18px; font-weight:700; color:var(--neutral-900);">AI Quant Evaluator анализирует базу...</div>
      <div style="font-size:12.5px; color:var(--neutral-600); margin-top:6px; max-width:460px; margin-left:auto; margin-right:auto;">
        Сопоставляем цены, отлежку, активность за 2 недели, очки Steam, потенциальный уровень, CS2 часы и риски происхождения по всем аккаунтам.
      </div>
    </div>
  `;
  modal.classList.add('open');

  let pool = [];

  try {
    const params = new URLSearchParams();
    if (STATE.filters.gameTitles && STATE.filters.gameTitles.length) {
      STATE.filters.gameTitles.forEach(g => params.append('game', g));
    }
    if (STATE.filters.cs2Prime) params.append('cs2_prime', '1');
    if (STATE.filters.noVac) params.append('no_vac', '1');
    if (STATE.filters.minPrice > 0) params.append('min_price', STATE.filters.minPrice);
    if (STATE.filters.maxPrice > 0 && STATE.filters.maxPrice < 100000) params.append('max_price', STATE.filters.maxPrice);
    if (STATE.filters.minDaybreak > 0) params.append('min_daybreak', STATE.filters.minDaybreak);
    if (STATE.filters.maxHours2w < 100) {
      params.append('max_hours_2w', STATE.filters.maxHours2w);
      params.append('hours_2weeks', STATE.filters.maxHours2w);
    }
    if (STATE.filters.minLevel > 0) params.append('min_level', STATE.filters.minLevel);
    if (STATE.filters.maxLevel > 0) params.append('max_level', STATE.filters.maxLevel);
    if (STATE.filters.minPoints > 0) params.append('min_points', STATE.filters.minPoints);
    if (STATE.filters.maxPoints > 0) params.append('max_points', STATE.filters.maxPoints);
    if (STATE.filters.minPotLevel > 0) params.append('min_pot_level', STATE.filters.minPotLevel);
    if (STATE.filters.maxPotLevel > 0) params.append('max_pot_level', STATE.filters.maxPotLevel);
    if (STATE.filters.itemOrigin && STATE.filters.itemOrigin !== 'any') params.append('item_origin', STATE.filters.itemOrigin);
    if (STATE.filters.emailType && STATE.filters.emailType !== 'any') params.append('email_type', STATE.filters.emailType);
    params.append('limit', '100');

    const endpoint = STATE.searchSource === 'db' ? '/api/db/search' : '/api/live_search';
    const resp = await fetch(`${endpoint}?${params.toString()}`);
    if (resp.ok) {
      const data = await resp.json();
      if (data.items && data.items.length > 0) {
        pool = data.items;
      }
    }
  } catch (e) {
    console.warn('Could not fetch expanded pool for AI analysis:', e);
  }

  if (pool.length === 0) {
    pool = [...STATE.items];
  }

  if (pool.length === 0) {
    alert('По текущим фильтрам не найдено лотов для анализа. Попробуйте ослабить фильтры.');
    modal.classList.remove('open');
    return;
  }

  // Run full algorithm
  const ranked = analyzeAndRankComparedAccounts(pool);
  LAST_JUICE_RANKED = ranked;
  LAST_JUICE_TOTAL_COUNT = ranked.length;
  CURRENT_LEADERBOARD_TAB = 'all';

  // Auto-populate compared items with Top 4 candidates
  STATE.comparedItems.clear();
  ranked.slice(0, 4).forEach(entry => {
    const id = entry.item.item_id || entry.item.id;
    STATE.comparedItems.set(id, entry.item);
  });
  updateCompareBadge();
  updateCompareFloatingBar();
  renderCurrentItems();

  renderJuiceModalView(ranked, LAST_JUICE_TOTAL_COUNT, 'all');
};

window.switchJuiceLeaderboardTab = function(tabName) {
  CURRENT_LEADERBOARD_TAB = tabName;
  renderJuiceModalView(LAST_JUICE_RANKED, LAST_JUICE_TOTAL_COUNT, tabName);
};

function renderJuiceModalView(rankedList, totalCount, activeTab = 'all') {
  const modal = document.getElementById('compareModalOverlay');
  const body = document.getElementById('compareModalBody');
  const tag = document.getElementById('modalCompareCountTag');
  if (!modal || !body || !rankedList || rankedList.length === 0) return;

  if (tag) tag.textContent = `ТОП из ${totalCount} лотов`;

  // Sort according to active tab for the leaderboard section
  let sortedForLeaderboard = [...rankedList];
  if (activeTab === 'safety') {
    sortedForLeaderboard.sort((a, b) => b.safetyScore - a.safetyScore || b.daybreak - a.daybreak);
  } else if (activeTab === 'points') {
    sortedForLeaderboard.sort((a, b) => b.points - a.points || b.potLvl - a.potLvl);
  } else if (activeTab === 'price') {
    sortedForLeaderboard.sort((a, b) => a.price - b.price);
  }

  const topGroup = rankedList.slice(0, Math.min(4, rankedList.length));
  const winner = rankedList[0];

  // Winner Rationale
  let winnerRationale = '';
  if (winner) {
    const reasons = [];
    if (winner.daybreak >= 60) reasons.push(`🛡️ рекордную отлежку ${winner.daybreak} дн (шанс реса минимален)`);
    if (winner.hours2w === 0) reasons.push(`⚡ 0.0ч за 2 недели (полный оффлайн)`);
    if (winner.points >= 15000) reasons.push(`💎 ${winner.points.toLocaleString()} очков Steam (ап до ${winner.potLvl} Lvl)`);
    if (winner.isMinPrice) reasons.push(`💰 лучшую цену в выборке (${formatCurrency(winner.price)})`);
    if (winner.originMeta.riskTier === 'safe') reasons.push(`👑 безопасное происхождение`);

    winnerRationale = reasons.length 
      ? `ИИ выбрал лот #${winner.item.item_id || winner.item.id} как АБСОЛЮТНЫЙ САМЫЙ СОК за счёт: ${reasons.join(', ')}.`
      : `Лот #${winner.item.item_id || winner.item.id} показал максимальный суммарный скоринг среди всех ${totalCount} проверенных аккаунтов.`;
  }

  body.innerHTML = `
    <!-- Top AI Quant Recommendation Podium Banner -->
    <div class="advisor-top-banner">
      <div class="advisor-banner-left">
        <div class="advisor-badge-pill">🏆 ТОП-1 АБСОЛЮТНЫЙ САМЫЙ СОК (ИЗ ${totalCount} ЛОТОВ)</div>
        <div class="advisor-headline">
          ${escapeHtml(winner.item.title || `Аккаунт #${winner.item.item_id || winner.item.id}`)} · ${formatCurrency(winner.price)}
        </div>
        <div class="advisor-rationale-text">${winnerRationale}</div>
      </div>
      <div class="advisor-banner-right">
        <div class="advisor-score-box">
          <div class="advisor-score-number">${winner.advisorScore}</div>
          <div class="advisor-score-lbl">AI Score</div>
        </div>
        <a href="https://lzt.market/${winner.item.item_id || winner.item.id}/" target="_blank" class="advisor-btn-buy">
          <span>Купить САМЫЙ СОК</span>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
      </div>
    </div>

    <!-- Side-by-Side Top Candidates Grid -->
    <div class="compare-grid-deck" style="grid-template-columns: repeat(${topGroup.length}, minmax(270px, 1fr));">
      ${topGroup.map((entry, idx) => {
        const it = entry.item;
        const itemId = it.item_id || it.id;
        const rankNum = idx + 1;
        const isTop = rankNum === 1;
        const rankTagClass = rankNum === 1 ? 'rank-1' : (rankNum === 2 ? 'rank-2' : 'rank-other');
        const rankLabel = rankNum === 1 ? '🥇 #1 САМЫЙ СОК' : (rankNum === 2 ? '🥈 #2 АЛЬТЕРНАТИВА' : `#${rankNum} МЕСТО`);
        const lastAct = formatLastActivityDate(it);

        return `
          <div class="compare-card-col ${isTop ? 'top-pick' : ''}">
            <div>
              <!-- Header with Rank -->
              <div class="compare-col-header">
                <span class="compare-rank-tag ${rankTagClass}">${rankLabel}</span>
                <button class="btn-remove-compare" onclick="toggleCompare(${itemId})" title="Убрать">✕</button>
              </div>

              <!-- Price & Score -->
              <div class="compare-price-row">
                <div class="compare-price-val ${entry.isMinPrice ? 'val-best' : ''}">${formatCurrency(entry.price)}</div>
                <span class="compare-score-pill ${entry.advisorScore >= 80 ? 'high' : 'good'}">${entry.advisorScore}/100 Score</span>
              </div>

              <!-- Title -->
              <div class="compare-title-text" title="${escapeHtml(it.title || '')}">${escapeHtml(it.title || '')}</div>

              <!-- Factor Breakdown Bars -->
              <div class="compare-factor-bars">
                <div class="factor-row">
                  <span class="factor-lbl">🛡️ Безопасность</span>
                  <div class="factor-track"><div class="factor-bar safety" style="width:${entry.safetyScore}%"></div></div>
                  <span class="factor-num">${entry.safetyScore}</span>
                </div>
                <div class="factor-row">
                  <span class="factor-lbl">💎 Очки & LVL</span>
                  <div class="factor-track"><div class="factor-bar value" style="width:${entry.valueScore}%"></div></div>
                  <span class="factor-num">${entry.valueScore}</span>
                </div>
                <div class="factor-row">
                  <span class="factor-lbl">🎮 Библиотека</span>
                  <div class="factor-track"><div class="factor-bar content" style="width:${entry.contentScore}%"></div></div>
                  <span class="factor-num">${entry.contentScore}</span>
                </div>
              </div>

              <!-- Metrics -->
              <div class="compare-metrics-list">
                <div class="compare-metric-row">
                  <span class="compare-metric-lbl">🕒 Отлежка:</span>
                  <span class="compare-metric-val ${entry.isMaxDaybreak ? 'val-best' : ''}">
                    ${entry.daybreak} дн (${lastAct})
                  </span>
                </div>

                <div class="compare-metric-row">
                  <span class="compare-metric-lbl">⚡ 2 недели:</span>
                  <span class="compare-metric-val ${entry.hours2w === 0 ? 'val-best' : 'val-warn'}">
                    ${entry.hours2w === 0 ? '0.0 ч (Оффлайн ✓)' : `${entry.hours2w} ч`}
                  </span>
                </div>

                <div class="compare-metric-row">
                  <span class="compare-metric-lbl">🔮 Потенц. Level:</span>
                  <span class="compare-metric-val ${entry.isMaxPotLvl ? 'val-best-violet' : ''}">
                    Lvl ${entry.lvl} ➜ <strong>${entry.potLvl} ⭐</strong>
                  </span>
                </div>

                <div class="compare-metric-row">
                  <span class="compare-metric-lbl">🪙 Очки Steam:</span>
                  <span class="compare-metric-val ${entry.isMaxPoints ? 'val-best-violet' : ''}">
                    ${entry.points.toLocaleString()} pts
                  </span>
                </div>

                <div class="compare-metric-row">
                  <span class="compare-metric-lbl">🏷️ Происхождение:</span>
                  <span class="compare-metric-val ${entry.originMeta.riskTier === 'safe' ? 'val-best' : (entry.originMeta.riskTier === 'danger' ? 'val-danger' : '')}">
                    ${entry.originMeta.label}
                  </span>
                </div>

                <div class="compare-metric-row">
                  <span class="compare-metric-lbl">🎯 CS2:</span>
                  <span class="compare-metric-val ${entry.isMaxCs2Hours ? 'val-best' : ''}">
                    ${entry.hasPrime ? 'Prime ✓' : 'No Prime'} · ${entry.cs2Hours} ч
                  </span>
                </div>
              </div>

              <!-- Pros & Cons -->
              <div class="compare-pros-cons-box">
                ${entry.pros.slice(0, 3).map(p => `<div class="compare-pro-chip">${escapeHtml(p)}</div>`).join('')}
                ${entry.cons.slice(0, 2).map(c => `<div class="compare-con-chip">${escapeHtml(c)}</div>`).join('')}
              </div>
            </div>

            <!-- CTA -->
            <div class="compare-cta-row">
              <button class="btn-compare-spec" onclick="openDetailsModal(${itemId})" title="Досье">
                <span>Досье</span>
              </button>
              <a href="https://lzt.market/${itemId}/" target="_blank" class="btn-compare-buy">
                <span>Купить ↗</span>
              </a>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Full Analyzed Leaderboard Table -->
    <div class="juice-leaderboard-section">
      <div class="juice-leaderboard-header">
        <div class="juice-leaderboard-title">
          <span>📊 Полный рейтинг всей выборки (${totalCount} лотов)</span>
        </div>
        <div class="leaderboard-tab-pills">
          <button class="leaderboard-tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="switchJuiceLeaderboardTab('all')">🏆 Общий ТОП (Самый сок)</button>
          <button class="leaderboard-tab-btn ${activeTab === 'safety' ? 'active' : ''}" onclick="switchJuiceLeaderboardTab('safety')">🛡️ Макс. Отлежка</button>
          <button class="leaderboard-tab-btn ${activeTab === 'points' ? 'active' : ''}" onclick="switchJuiceLeaderboardTab('points')">💎 Очки Steam & LVL</button>
          <button class="leaderboard-tab-btn ${activeTab === 'price' ? 'active' : ''}" onclick="switchJuiceLeaderboardTab('price')">💰 Мин. Цена</button>
        </div>
      </div>

      <div class="juice-table-container">
        <table class="juice-table">
          <thead>
            <tr>
              <th>Ранг</th>
              <th>Цена</th>
              <th>Название лота</th>
              <th>Отлежка</th>
              <th>2 нед</th>
              <th>Очки Steam</th>
              <th>Потенц. LVL</th>
              <th>Происхождение</th>
              <th>AI Score</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            ${sortedForLeaderboard.slice(0, 30).map((entry, idx) => {
              const it = entry.item;
              const itemId = it.item_id || it.id;
              const rank = idx + 1;
              const isWinner = rank === 1 && activeTab === 'all';

              return `
                <tr class="${isWinner ? 'winner-row' : ''}">
                  <td>
                    <span class="table-rank-pill ${rank === 1 ? 'table-rank-1' : (rank === 2 ? 'table-rank-2' : (rank === 3 ? 'table-rank-3' : ''))}">
                      ${rank === 1 ? '🥇 1' : (rank === 2 ? '🥈 2' : (rank === 3 ? '🥉 3' : `#${rank}`))}
                    </span>
                  </td>
                  <td><strong style="color:var(--neutral-900);">${formatCurrency(entry.price)}</strong></td>
                  <td style="max-width:220px; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(it.title || '')}">${escapeHtml(it.title || '')}</td>
                  <td><span style="${entry.daybreak >= 60 ? 'color:var(--accent-emerald); font-weight:600;' : ''}">${entry.daybreak} дн</span></td>
                  <td><span style="${entry.hours2w === 0 ? 'color:var(--accent-emerald); font-weight:600;' : 'color:var(--accent-amber);'}">${entry.hours2w} ч</span></td>
                  <td><span style="${entry.points >= 15000 ? 'color:var(--accent-violet); font-weight:600;' : ''}">${entry.points.toLocaleString()}</span></td>
                  <td><strong>${entry.lvl} ➜ ${entry.potLvl} ⭐</strong></td>
                  <td><span style="font-size:10.5px;">${entry.originMeta.label}</span></td>
                  <td><strong style="color:var(--accent-indigo);">${entry.advisorScore}/100</strong></td>
                  <td>
                    <div class="table-actions-cell">
                      <button class="table-btn-compare" onclick="toggleCompare(${itemId})" title="Добавить/Убрать из сравнения">⚖</button>
                      <button class="table-btn-compare" onclick="openDetailsModal(${itemId})" title="Досье">Инфо</button>
                      <a href="https://lzt.market/${itemId}/" target="_blank" class="table-btn-buy">Купить ↗</a>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCompareModal() {
  const modal = document.getElementById('compareModalOverlay');
  const body = document.getElementById('compareModalBody');
  const tag = document.getElementById('modalCompareCountTag');
  if (!modal || !body) return;

  const items = Array.from(STATE.comparedItems.values());
  if (tag) tag.textContent = `${items.length} / 6`;

  if (items.length === 0) {
    modal.classList.remove('open');
    return;
  }

  const ranked = analyzeAndRankComparedAccounts(items);
  LAST_JUICE_RANKED = ranked;
  LAST_JUICE_TOTAL_COUNT = ranked.length;
  renderJuiceModalView(ranked, ranked.length, 'all');
  modal.classList.add('open');
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================
function formatCurrency(rubAmount) {
  if (STATE.currency === 'EUR') {
    const eur = (rubAmount / STATE.eurRubRate).toFixed(2);
    return `€ ${eur}`;
  }
  return `${rubAmount.toLocaleString()} ₽`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPagination(totalItems, currentPage, perPage) {
  const paginationBar = document.getElementById('paginationBar');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pillsRow = document.getElementById('pagePillsRow');
  if (!paginationBar || !pillsRow) return;

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (totalPages <= 1) {
    paginationBar.style.display = 'none';
    return;
  }
  paginationBar.style.display = 'flex';

  if (prevBtn) {
    prevBtn.classList.toggle('disabled', currentPage <= 1);
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        STATE.filters.page = currentPage - 1;
        loadSingleListings();
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    };
  }

  if (nextBtn) {
    nextBtn.classList.toggle('disabled', currentPage >= totalPages);
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        STATE.filters.page = currentPage + 1;
        loadSingleListings();
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    };
  }

  let html = '';
  const maxPills = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxPills - 1);
  if (endPage - startPage < maxPills - 1) {
    startPage = Math.max(1, endPage - maxPills + 1);
  }

  if (startPage > 1) {
    html += `<button class="page-num-pill" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) html += `<span class="page-dots">...</span>`;
  }

  for (let p = startPage; p <= endPage; p++) {
    const activeClass = p === currentPage ? 'active' : '';
    html += `<button class="page-num-pill ${activeClass}" onclick="goToPage(${p})">${p}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
    html += `<button class="page-num-pill" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }

  pillsRow.innerHTML = html;
}

window.goToPage = function(page) {
  STATE.filters.page = page;
  loadSingleListings();
  window.scrollTo({ top: 400, behavior: 'smooth' });
};

