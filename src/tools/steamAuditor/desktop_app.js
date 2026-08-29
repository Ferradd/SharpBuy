import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { SteamSessionEngine } from './SteamSessionEngine.js';
import { WalletSecurityCollector } from './Collectors/WalletSecurityCollector.js';
import { CS2FaceitCollector } from './Collectors/CS2FaceitCollector.js';
import { GamesInventoryCollector } from './Collectors/GamesInventoryCollector.js';
import { CommercialTitlesAuditor } from './Collectors/CommercialTitlesAuditor.js';
import { ValuationEngine } from './ValuationEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

const PORT = 3888;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
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

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  if (pathname === '/' || pathname === '/auditor') {
    pathname = '/public/auditor.html';
  }

  // 1. API: Read stock tokens from steam.txt
  if (pathname === '/api/get-stock-tokens') {
    try {
      const paths = [
        'C:\\Users\\iliyk\\Desktop\\steam.txt',
        path.join(rootDir, 'steam.txt')
      ];
      let foundContent = '';
      for (const p of paths) {
        if (fs.existsSync(p)) {
          foundContent = fs.readFileSync(p, 'utf8');
          break;
        }
      }
      const tokenMatches = foundContent.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, count: tokenMatches.length, tokens: tokenMatches }));
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: e.message }));
      return;
    }
  }

  // 2. API: Live Audit Single Token (Full Pipeline!)
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
        acc = await CommercialTitlesAuditor.auditCommercialTitles(acc);
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

  // Serve static files
  let filePath = path.join(rootDir, pathname.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    filePath = path.join(rootDir, 'public', pathname.replace(/^\//, ''));
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`  🦅 SharpBuy Steam Auditor GUI running at http://localhost:${PORT}`);
  console.log(`================================================================\n`);
  exec(`start http://localhost:${PORT}`);
});
