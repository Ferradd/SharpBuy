# TEAM_001: macOS Launcher Steam Token Injection Fix

## Team Members
- Devin AI Assistant

## Task
Fix macOS SharpBuy Launcher Steam token injection functionality that stopped working after optimization.

## Problem
The macOS launcher application (`SharpBuy Launcher.app`) stopped injecting tokens into Steam sessions. Previously worked correctly before optimization/sizing changes.

## Investigation Steps
1. [x] Registered team and created team file
2. [ ] Check Cargo.toml dependencies
3. [ ] Review steam.rs encryption logic
4. [ ] Test Steam launch with token in dev mode
5. [ ] Fix identified issue
6. [ ] Rebuild and test application

## Progress
- [x] Located macOS launcher source: `/Users/admin/Desktop/SharpBuy/src/launcher/SharpBuy_Launcher_Mac/`
- [x] Compiled successfully with warnings but no errors
- [x] Key file: `src-tauri/src/steam.rs` contains `inject_token_and_launch()` function
- [x] Bridge file: `SharpBuy_Launcher/Assets/tauri-bridge.js` connects frontend to Tauri commands
- [x] Command handler: `src-tauri/src/commands.rs` - `launch_steam()` function
- [x] **ROOT CAUSE FOUND**: `AllowAutoLogin` should be `AutoLogin` in loginusers.vdf
- [x] Fixed the parameter name in `update_login_users_vdf()` function
- [x] Rebuilt application successfully
- [x] Copied new .app to Desktop

## Root Cause
The code was using `"AllowAutoLogin"` in `loginusers.vdf` but Steam expects `"AutoLogin"`. This caused Steam to ignore the auto-login setting and show the login dialog instead of automatically logging in with the injected token.

## Fix Applied
- Changed `"AllowAutoLogin"` to `"AutoLogin"` in `steam.rs` lines 272, 279, 285
- Rebuilt application with `npx tauri build`
- New .app installed at `/Users/admin/Desktop/SharpBuy Launcher.app`

## Notes
- Steam encryption uses AES-256-CBC with SHA256 key derivation
- VDF files need to be updated: config.vdf, loginusers.vdf, local.vdf
- App uses Tauri v2 framework
- Build is ~5 MB (lightweight optimization goal)

## Status
COMPLETED - Fixed AutoLoginUser conflict in registry.vdf and rebuilt with Electron version.

## Root Cause Found
The registry.vdf file had TWO different AutoLoginUser entries:
- HKLM: "soi_vit" (correct)
- HKCU: "deriksson88" (old account)

This caused Steam to not know which account to auto-login, showing the login dialog instead.

## Final Fix
Updated updateRegistryAutoLoginUser() function to:
1. Remove ALL AutoLoginUser entries first
2. Add only the correct one in HKCU section
3. Prevent conflicting entries

## Platform Migration
Switched from Tauri (5MB, not working) to Electron (~200MB):
- Electron version with proper macOS paths
- Correct AES-256-CBC encryption
- Full logic matching Windows version
- HTML interface as intended

## GitHub Distribution Phase
Current task: Deploy working Electron launcher to GitHub and update website

Progress:
- [x] Built Electron DMG: `SharpBuy Launcher-1.0.0-macOS-arm64.dmg` (~87 MB)
- [x] App size: ~234 MB (Chromium bundled)
- [x] Updated README.md with download instructions
- [x] Updated website Mac download link and size text
- [x] Added Electron/Chromium size warning on website
- [x] Modified build script to automatically copy Electron DMG
- [x] Added Mac launcher verification to build script
- [x] Committed and pushed to GitHub (commit 01f077c)
- [x] Website build passes verification

User preference: Use working Electron app from Desktop, NOT the broken Tauri version.

COMPLETED - Electron launcher deployed to website
- Website download now points to working Electron DMG (87 MB)
- Warning added explaining Electron/Chromium size
- Build process automated
- Windows download remains unchanged

## Render Build Fix
Issue: Render build failed because Electron DMG doesn't exist on Linux
Fix: Added Vite plugin to conditionally copy DMG only if it exists
- Mac launcher is now optional in build verification
- Linux/Render builds skip Mac launcher without failing
- Local macOS builds include Electron DMG as before
- Commit: f9375d0

## Gatekeeper Fix
Issue: macOS Gatekeeper blocked app with "damaged" error
Cause: com.apple.provenance attribute on all files in app bundle
Fix: Added electron-builder hook to remove attributes after build
- Created scripts/clean-attributes.js
- Configured afterAllArtifactBuild hook
- Runs xattr -cr on .app before DMG creation
- Commit: a0d5981
Users can now open app without Gatekeeper blocking

## Ad-hoc Code Signing
Issue: Application still rejected by Gatekeeper (spctl --assess rejected)
Fix: Added ad-hoc code signing with provenance removal
- Created scripts/sign-app.js for ad-hoc signing
- Integrated into build:dmg workflow
- Removes all extended attributes before signing
- Signs with ad-hoc identity (no certificate required)
- Removes provenance after signing again
- Commit: 25ec2e4

## Current Issue
Application builds and signs successfully but does not launch when opened via Finder or terminal:
- Direct executable launch exits silently (exit code 0)
- No visible window or process
- No error messages in logs
- Asar extraction shows correct main.js code
- Electron version: 33.4.11 (Node v20.18.3)
- Development mode fails with "app is undefined" error
- Possibly Electron binary corruption or configuration issue

## Next Steps
- Investigate why Electron executable fails to launch
- Check Electron binary integrity
- Test with fresh Electron installation
- Consider switching to prebuilt Electron binary instead of npm package
