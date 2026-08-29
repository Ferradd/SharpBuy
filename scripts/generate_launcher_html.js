import fs from 'fs';

const origHtml = fs.readFileSync('c:\\Users\\iliyk\\Desktop\\SharpBuy_Frontend\\index.html', 'utf8');

// The bridge script to inject before </body>
const bridgeScript = `
  <script>
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
          if (path) {
            var el = document.getElementById('steamPathDisplay');
            if (el) el.innerText = path.replace(/\\\\/g, '/');
          }
        }
      } catch (e) {}
    }

    async function onTitleMouseDown(e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      while (target && target !== document.body) {
        if (target.className && typeof target.className === 'string' && (
            target.className.indexOf('window-btns') !== -1 || 
            target.className.indexOf('win-btn') !== -1 || 
            target.className.indexOf('link-action') !== -1 ||
            target.className.indexOf('btn-log-steam') !== -1 ||
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

// Replace script section in original HTML
let newHtml = origHtml;
const scriptIdx = newHtml.indexOf('<script>');
if (scriptIdx !== -1) {
  newHtml = newHtml.slice(0, scriptIdx) + bridgeScript;
} else {
  newHtml = newHtml.replace('</body>\n</html>', bridgeScript);
}

fs.writeFileSync('c:\\Users\\iliyk\\Desktop\\SharpBuy\\src\\launcher\\SharpBuy_Launcher\\Assets\\index.html', newHtml, 'utf8');
console.log('Successfully updated src/launcher/SharpBuy_Launcher/Assets/index.html with full original brand logos, SVGs and WebView2 bridge!');
