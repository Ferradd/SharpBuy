export default async function handler(req, res) {
  try {
    const [stockRes, productsRes] = await Promise.all([
      fetch('https://shefu223.shop/api/nfa-stock', { headers: { 'Accept': 'application/json' } }),
      fetch('https://shefu223.shop/api/products', { headers: { 'Accept': 'application/json' } })
    ]);

    const stock = stockRes.ok ? await stockRes.json() : null;
    const products = productsRes.ok ? await productsRes.json() : null;

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ success: true, stock, products });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
