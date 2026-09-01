# SharpBuy Launcher

Desktop NFA launcher for Steam token login.

## Structure

```
src/launcher/
├── SharpBuy_Launcher/       Windows — C# + WebView2 (~2 MB exe)
│   └── Assets/              Shared UI (index.html, tauri-bridge.js, icon.ico)
├── SharpBuy_Launcher_Mac/   macOS — Tauri + WKWebView (~5 MB dmg)
│   └── src-tauri/
└── README.md
```

**UI is shared:** `SharpBuy_Launcher/Assets/index.html` is used by both Windows and Mac builds.

## Windows build

```powershell
pwsh scripts/publish_launcher.ps1
```

Output: `public/SharpBuy_Launcher.exe`

## Mac build (on macOS only)

```bash
cd src/launcher/SharpBuy_Launcher_Mac
npm install
npm run tauri build
```

Output: `src-tauri/target/release/bundle/dmg/*.dmg` → copy to `public/SharpBuy_Launcher.dmg`

Or:

```bash
bash scripts/publish_launcher_mac.sh
```

## Downloads (site)

| Platform | File |
|----------|------|
| Windows | `/SharpBuy_Launcher.exe` |
| macOS (Apple Silicon) | `/SharpBuy_Launcher.dmg` |
