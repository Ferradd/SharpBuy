import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
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
