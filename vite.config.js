import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// TEAM_001: Vite plugin to copy Electron DMG to dist if it exists
function copyElectronDMG() {
  return {
    name: 'copy-electron-dmg',
    closeBundle() {
      const sourcePath = 'src/launcher/SharpBuy_Launcher_Electron/dist/SharpBuy Launcher-1.0.0-macOS-arm64.dmg'
      const destPath = 'dist/SharpBuy_Launcher.dmg'

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath)
        console.log(`Copied Electron DMG to dist/SharpBuy_Launcher.dmg`)
      } else {
        console.log(`Warning: Electron DMG not found at ${sourcePath}, skipping copy`)
      }
    }
  }
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    copyElectronDMG(),
    {
      name: 'shefu-stock-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/sync-shefu-stock', async (req, res) => {
          try {
            const [stockRes, productsRes] = await Promise.all([
              fetch('https://shefu223.shop/api/nfa-stock', { headers: { 'Accept': 'application/json' } }),
              fetch('https://shefu223.shop/api/products', { headers: { 'Accept': 'application/json' } })
            ]);
            const stock = stockRes.ok ? await stockRes.json() : null;
            const products = productsRes.ok ? await productsRes.json() : null;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, stock, products }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      }
    }
  ]
})
