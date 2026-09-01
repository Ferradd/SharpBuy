# SharpBuy Mac Launcher

Integrated into the main repo at `src/launcher/SharpBuy_Launcher_Mac/`.

## Build (macOS only)

```bash
bash scripts/publish_launcher_mac.sh
```

Or manually:

```bash
cd src/launcher/SharpBuy_Launcher_Mac
npm install
npm run tauri build
cp src-tauri/target/release/bundle/dmg/*.dmg ../../../public/SharpBuy_Launcher.dmg
```

## Shared UI

Both platforms use `src/launcher/SharpBuy_Launcher/Assets/index.html`.

Mac adds `tauri-bridge.js` in the same folder (ignored by Windows WebView2 unless loaded via script tag).

## Download

Site serves `public/SharpBuy_Launcher.dmg` (~5 MB, Apple Silicon).

## Stack

- **Tauri 2** + **WKWebView** (system Safari engine)
- Rust: `steam.rs`, `commands.rs`, `api.rs`, `accounts.rs`

Not Electron — no bundled Chromium.
