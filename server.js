import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Load our API handlers
import createOrderHandler from './api/create-order.js';
import checkPaymentHandler from './api/check-payment.js';
import warrantyCheckHandler from './api/warranty-check.js';
import steamVerifyHandler from './api/steam-verify.js';
import authHandler from './api/auth.js';
import getOrdersHandler from './api/get-orders.js';
import getUserWalletHandler from './api/get-user-wallet.js';
import tokenIngestHandler from './api/token-ingest.js';
import keepaliveHandler from './api/keepalive.js';
import { startArbitrageCron } from './api/_utils/arbitrage-worker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simulate Vercel Serverless environment for API routes
app.all('/api/auth', (req, res) => authHandler(req, res));
app.all('/api/get-orders', (req, res) => getOrdersHandler(req, res));
app.all('/api/get-user-wallet', (req, res) => getUserWalletHandler(req, res));
app.post('/api/create-order', (req, res) => createOrderHandler(req, res));
app.post('/api/check-payment', (req, res) => checkPaymentHandler(req, res));
app.post('/api/warranty-check', (req, res) => warrantyCheckHandler(req, res));
app.post('/api/steam-verify', (req, res) => steamVerifyHandler(req, res));
app.all('/api/token-ingest', (req, res) => tokenIngestHandler(req, res));
app.all('/api/keepalive', (req, res) => keepaliveHandler(req, res));

// Serve the compiled frontend (includes public/ assets copied by Vite)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for React Router — never for static files with extensions
app.use((req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SHARPBUY ЛОКАЛЬНЫЙ СЕРВЕР ЗАПУЩЕН!`);
  console.log(`🌐 Откройте в браузере: http://localhost:${PORT}`);
  console.log(`======================================================\n`);

  // Start 5h 55m background arbitrage sniper
  startArbitrageCron();
});
