import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as esbuild from 'esbuild';

const rootDir = 'C:\\Users\\iliyk\\Desktop\\SharpBuy';
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('--- 1. Reading Frontend HTML ---');
const htmlContent = fs.readFileSync(path.join(rootDir, 'public/auditor.html'), 'utf8');

console.log('--- 2. Generating Master Server Entry ---');
const serverEntryCode = `
import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { SteamSessionEngine } from '../src/tools/steamAuditor/SteamSessionEngine.js';
import { WalletSecurityCollector } from '../src/tools/steamAuditor/Collectors/WalletSecurityCollector.js';
import { CS2FaceitCollector } from '../src/tools/steamAuditor/Collectors/CS2FaceitCollector.js';
import { GamesInventoryCollector } from '../src/tools/steamAuditor/Collectors/GamesInventoryCollector.js';
import { ValuationEngine } from '../src/tools/steamAuditor/ValuationEngine.js';

const PORT = 3888;
const embeddedHtml = ${JSON.stringify(htmlContent)};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, 'http://localhost:' + PORT);
  let pathname = parsedUrl.pathname;

  if (pathname === '/' || pathname === '/auditor' || pathname === '/public/auditor.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(embeddedHtml);
    return;
  }

  // 1. API to read steam.txt
  if (pathname === '/api/get-stock-tokens') {
    try {
      const userHome = process.env.USERPROFILE || process.env.HOME || 'C:\\\\Users\\\\iliyk';
      const candidatePaths = [
        path.join(userHome, 'Desktop', 'steam.txt'),
        'C:\\\\Users\\\\iliyk\\\\Desktop\\\\steam.txt',
        path.join(process.cwd(), 'steam.txt')
      ];
      let foundContent = '';
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          foundContent = fs.readFileSync(p, 'utf8');
          break;
        }
      }
      const tokenMatches = foundContent.match(/7656119\\d+----ey[A-Za-z0-9_\\-.]+/g) || [];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, count: tokenMatches.length, tokens: tokenMatches }));
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
      return;
    }
  }

  // 2. API: Live Audit Single Token (Full Server-Side Pipeline!)
  if (pathname === '/api/audit-single' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { token } = JSON.parse(body || '{}');
        if (!token) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Missing token' }));
          return;
        }

        const parsed = SteamSessionEngine.parseToken(token);
        if (!parsed) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Invalid token format' }));
          return;
        }

        const profile = await SteamSessionEngine.fetchLiveProfile(parsed.steamid);
        let acc = { ...parsed, profile };

        acc = await WalletSecurityCollector.auditStage2(acc);
        acc = await CS2FaceitCollector.auditStage3(acc);
        acc = await GamesInventoryCollector.auditStage4(acc);
        acc = ValuationEngine.evaluateAccount(acc);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, account: acc }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log('================================================================');
  console.log('  🦅 SharpBuy Steam Auditor & Valuation Suite is Running!');
  console.log('  URL: http://localhost:' + PORT);
  console.log('================================================================\\n');
  exec('start http://localhost:' + PORT);
});
`;

fs.writeFileSync(path.join(distDir, 'server_entry.js'), serverEntryCode, 'utf8');

console.log('--- 3. Bundling with esbuild (Inlines all collectors) ---');
esbuild.buildSync({
  entryPoints: [path.join(distDir, 'server_entry.js')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: path.join(distDir, 'bundle.cjs')
});

console.log('--- 4. Creating SEA Config ---');
const seaConfig = {
  main: path.join(distDir, 'bundle.cjs'),
  output: path.join(distDir, 'sea-prep.blob'),
  disableExperimentalSEAWarning: true
};
fs.writeFileSync(path.join(distDir, 'sea-config.json'), JSON.stringify(seaConfig, null, 2), 'utf8');

console.log('--- 5. Generating SEA Blob ---');
execSync(`node --experimental-sea-config "${path.join(distDir, 'sea-config.json')}"`, { stdio: 'inherit' });

console.log('--- 6. Creating Executable Binary ---');
const nodeExePath = process.execPath;
const targetExeDesktop = 'C:\\Users\\iliyk\\Desktop\\SharpBuy_Steam_Auditor.exe';
const targetExeDist = path.join(distDir, 'SharpBuy_Steam_Auditor.exe');

// Kill any running instances before copying
try {
  execSync('taskkill /F /IM SharpBuy_Steam_Auditor.exe', { stdio: 'ignore' });
} catch (e) {}

fs.copyFileSync(nodeExePath, targetExeDesktop);
fs.copyFileSync(nodeExePath, targetExeDist);

console.log('--- 7. Injecting Application Blob with Postject ---');
try {
  execSync(`npx postject "${targetExeDesktop}" NODE_SEA_BLOB "${path.join(distDir, 'sea-prep.blob')}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, { stdio: 'inherit' });
  execSync(`npx postject "${targetExeDist}" NODE_SEA_BLOB "${path.join(distDir, 'sea-prep.blob')}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, { stdio: 'inherit' });
  console.log('\n🎉 SUCCESS! SharpBuy_Steam_Auditor.exe generated at:');
  console.log(` -> ${targetExeDesktop}`);
  console.log(` -> ${targetExeDist}`);
} catch (e) {
  console.error('Postject error:', e.message);
}
