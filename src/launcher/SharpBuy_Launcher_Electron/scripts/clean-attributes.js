#!/usr/bin/env node
// TEAM_001: Remove com.apple.provenance from built Electron app to prevent Gatekeeper blocking
// This script is called by electron-builder afterAllArtifactsBuild hook
exports.default = async function(context) {
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');

  // Find the .app in the output directory
  const distDir = path.join(__dirname, '..', 'dist', 'mac-arm64');
  const appName = 'SharpBuy Launcher.app';
  const appPath = path.join(distDir, appName);

  if (!fs.existsSync(appPath)) {
    console.log(`App not found at ${appPath}, skipping attribute cleanup`);
    return;
  }

  try {
    console.log('Removing com.apple.provenance attributes from app...');
    execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });
    console.log('Attributes cleaned successfully');
  } catch (error) {
    console.error('Failed to clean attributes:', error.message);
    throw error;
  }
};
