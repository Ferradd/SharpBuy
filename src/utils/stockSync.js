import { PRODUCTS } from '../data/mockData';

const SLUG_MAP = {
  prime: '1776000000001',
  premier: '1776000000002',
  medals: '1776000000003',
  medals8: '1776000000005',
  skins: '1776000000008',
  knives: '1776000000009',
  rating: '1776000000004',
  rating15k: '1776000000006',
  rating20k: '1776000000007',
  rust: '1776000000010',
};

// Floor minimum prices in RUB to guarantee high profitability
const MIN_FLOOR_PRICES_RUB = {
  prime: 50,
  premier: 89,
  medals: 119,
  medals8: 149,
  skins: 259,
  knives: 349,
  rating: 129,
  rating15k: 179,
  rating20k: 199,
  rust: 149,
};

/**
 * Syncs stock counts and dynamic profitable prices from supplier API
 */
export async function syncLiveStockFromSupplier() {
  try {
    let stockData = null;
    let productsData = null;

    // 1. Try serverless endpoint first (Bypasses all CORS blocks)
    try {
      const apiRes = await fetch('/api/sync-shefu-stock');
      if (apiRes.ok) {
        const apiJson = await apiRes.json();
        if (apiJson.success) {
          stockData = apiJson.stock;
          productsData = apiJson.products;
        }
      }
    } catch (apiErr) {}

    // 2. Direct fallback if serverless endpoint isn't reached (e.g. static dev)
    if (!stockData) {
      const stockPromise = fetch('https://shefu223.shop/api/nfa-stock').then(r => r.json()).catch(() => null);
      const productsPromise = fetch('https://shefu223.shop/api/products').then(r => r.json()).catch(() => null);
      [stockData, productsData] = await Promise.all([stockPromise, productsPromise]);
    }

    // 3. Update stock counts in PRODUCTS array
    if (stockData && typeof stockData === 'object') {
      for (const [slug, count] of Object.entries(stockData)) {
        const prodId = SLUG_MAP[slug];
        const prod = PRODUCTS.find((p) => p.id === prodId || p.supplierSlug === slug);
        if (prod) {
          const num = Math.max(0, parseInt(count, 10) || 0);
          prod.stockCount = num;
          prod.inStock = num > 0;
        }
      }
    }

    // 4. Dynamic Price Margin Sync: Ensure we always sell at least at our floor price or Supplier GBP * 120 * 1.6 (+60% profit markup)
    if (productsData && productsData.nfa) {
      const gbpToRub = 120.0;
      const profitMultiplier = 1.6;

      for (const [slug, cfg] of Object.entries(productsData.nfa)) {
        const prodId = SLUG_MAP[slug];
        const prod = PRODUCTS.find((p) => p.id === prodId || p.supplierSlug === slug);
        if (prod && typeof cfg.price === 'number' && cfg.price > 0) {
          const supplierCostRub = cfg.price * gbpToRub;
          const calculatedRetailRub = Math.ceil((supplierCostRub * profitMultiplier) / 5) * 5;
          const floorMin = MIN_FLOOR_PRICES_RUB[slug] || 50;

          // Always pick whichever is higher to guarantee maximum profit
          prod.price = Math.max(floorMin, calculatedRetailRub);
          prod.oldPrice = Math.round(prod.price * 2.1);
        }
      }
    }

    // Dispatch global event for all React components to re-render immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sharpbuy-stock-synced', { detail: { stock: stockData } }));
    }

    return { stock: stockData, products: productsData };
  } catch (e) {
    console.warn('Stock & price sync notice:', e.message);
    return null;
  }
}
