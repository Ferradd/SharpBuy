#!/usr/bin/env node
// TEAM_001: Ad-hoc sign app for Gatekeeper bypass (no certificate required)
const { execSync } = require('child_process');
const path = require('path');

const appPath = path.join(__dirname, '..', 'dist', 'mac-arm64', 'SharpBuy Launcher.app');

console.log('Ad-hoc signing application...');

try {
  // Remove all extended attributes first
  console.log('Removing extended attributes...');
  execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });

  // Use ad-hoc signing (no certificate needed)
  console.log('Signing application with ad-hoc identity...');
  execSync(
    `codesign --force --deep --sign - "${appPath}"`,
    { stdio: 'inherit' }
  );

  // Remove provenance again after signing
  console.log('Removing provenance after signing...');
  execSync(`xattr -d com.apple.provenance "${appPath}" 2>/dev/null || true`, { stdio: 'inherit' });

  // Verify signature
  execSync(`codesign -v "${appPath}"`, { stdio: 'inherit' });

  console.log('Application signed successfully!');
  console.log('Note: Users will see "Verified but not from a verified developer" warning but can open the app.');

} catch (error) {
  console.error('Failed to sign app:', error.message);
  process.exit(1);
}
