async function checkVariants() {
  const ids = ['DF8AE966', '68034297', 'shf-df8ae966', 'shf-68034297', 'df8ae966', '68034297'];
  for (const id of ids) {
    try {
      const res = await fetch('https://shefu223.shop/api/nfa-downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfa_order: id })
      });
      const data = await res.json();
      console.log(`ID [${id}]:`, JSON.stringify(data));
    } catch (e) {
      console.log(`ID [${id}] error:`, e.message);
    }
  }
}

checkVariants().catch(console.error);
