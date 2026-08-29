import { runArbitrageScan } from './_utils/arbitrage-worker.js';

export default async function handler(req, res) {
  try {
    console.log('[VercelCron] Executing 5-minute warranty arbitrage cycle...');
    await runArbitrageScan();
    return res.status(200).json({ success: true, message: 'Arbitrage scan completed on Vercel' });
  } catch (error) {
    console.error('[VercelCron] Scan error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
