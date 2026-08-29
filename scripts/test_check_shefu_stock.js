async function testShefuStock() {
  try {
    const res = await fetch('https://shefu223.shop/api/nfa-catalog');
    console.log('Catalog status:', res.status);
    const data = await res.json();
    console.log('Catalog products:');
    for (const p of data.products || []) {
      console.log(`- Slug: ${p.slug || p.id} | Title: ${p.name || p.title} | Price: €${p.price_eur || p.price} | Stock: ${p.stock || p.available || 'In stock'}`);
    }
  } catch (e) {
    console.log('Error fetching catalog:', e.message);
  }
}

testShefuStock();
