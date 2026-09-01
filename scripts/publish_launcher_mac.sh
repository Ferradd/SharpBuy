#!/bin/bash
# Build SharpBuy Mac launcher (Tauri) and update public/SharpBuy_Launcher.dmg
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAC="$ROOT/src/launcher/SharpBuy_Launcher_Mac"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Mac launcher must be built on macOS (Tauri + WKWebView)."
  exit 1
fi

cd "$MAC"
npm install
npm run tauri build

DMG="$(find "$MAC/src-tauri/target/release/bundle/dmg" -name '*.dmg' -type f | head -1)"
if [[ -z "$DMG" ]]; then
  echo "DMG not found after build"
  exit 1
fi

cp "$DMG" "$ROOT/public/SharpBuy_Launcher.dmg"
echo "Done: public/SharpBuy_Launcher.dmg ($(du -h "$ROOT/public/SharpBuy_Launcher.dmg" | cut -f1))"
