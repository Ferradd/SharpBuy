import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

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

// Find root dir
const execDir = process.cwd();
console.log('Starting SharpBuy Steam Auditor...');
console.log('Working Directory:', execDir);

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

  // API endpoint to read steam.txt from Desktop or current folder
  if (pathname === '/api/get-stock-tokens') {
    try {
      const paths = [
        'C:\\Users\\iliyk\\Desktop\\steam.txt',
        path.join(execDir, 'steam.txt'),
        path.join(execDir, 'Desktop', 'steam.txt')
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

  // Try locating the requested file
  const searchDirs = [
    execDir,
    path.join(execDir, 'public'),
    path.join(execDir, 'src'),
    path.join('C:\\Users\\iliyk\\Desktop\\SharpBuy'),
    path.join('C:\\Users\\iliyk\\Desktop\\SharpBuy\\public')
  ];

  let resolvedPath = null;
  const cleanPath = pathname.replace(/^\//, '');

  for (const dir of searchDirs) {
    const candidate = path.join(dir, cleanPath);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      resolvedPath = candidate;
      break;
    }
  }

  if (resolvedPath) {
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(resolvedPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`  🦅 SharpBuy Steam Auditor GUI running at http://localhost:${PORT}`);
  console.log(`================================================================\n`);
  
  // Auto-launch default browser on Windows
  exec(`start http://localhost:${PORT}`);
});
