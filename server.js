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
import accountLibraryHandler from './api/account-library.js';
import syncShefuStockHandler from './api/sync-shefu-stock.js';
import arbitrageCronHandler from './api/arbitrage-cron.js';
import { startArbitrageCron } from './api/_utils/arbitrage-worker.js';
import { startFulfillmentCron } from './api/_utils/fulfillment-worker.js';

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
app.post('/api/create-anypay-payment', async (req, res) => {
  const handler = await import('./api/create-anypay-payment.js');
  return handler.default(req, res);
});
app.post('/api/check-anypay-payment', async (req, res) => {
  const handler = await import('./api/check-anypay-payment.js');
  return handler.default(req, res);
});
app.all('/api/anypay-webhook', async (req, res) => {
  const handler = await import('./api/anypay-webhook.js');
  return handler.default(req, res);
});
app.post('/api/warranty-check', (req, res) => warrantyCheckHandler(req, res));
app.post('/api/steam-verify', (req, res) => steamVerifyHandler(req, res));
app.all('/api/token-ingest', (req, res) => tokenIngestHandler(req, res));
app.all('/api/keepalive', (req, res) => keepaliveHandler(req, res));
app.all('/api/account-library', (req, res) => accountLibraryHandler(req, res));
app.all('/api/sync-shefu-stock', (req, res) => syncShefuStockHandler(req, res));
app.all('/api/arbitrage-cron', (req, res) => arbitrageCronHandler(req, res));

// Verification Routes
app.get('/anypay-verification.txt', (req, res) => {
  res.type('text/plain');
  res.send('99565dd75d69594592785b7711e3');
});
app.get('/lava-verify_6d9d04ce4c105ca6.html', (req, res) => {
  res.type('text/html');
  res.send('lava-verify');
});
app.get('/lava-verify_6d9d04ce4c105ca6.txt', (req, res) => {
  res.type('text/plain');
  res.send('lava-verify');
});

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
  // Deliver stuck PROCURING orders even if client closed checkout tab
  startFulfillmentCron(45_000);
});
