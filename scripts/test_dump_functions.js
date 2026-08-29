async function dumpFunctions() {
  const res = await fetch('https://nfa.shefu223.shop');
  const html = await res.text();

  const checkFn = html.slice(html.indexOf('async function checkWarranty()'), html.indexOf('async function claimWarranty()'));
  console.log('=== checkWarranty ===\n', checkFn);

  const claimFn = html.slice(html.indexOf('async function claimWarranty()'), html.indexOf('async function claimWarranty()') + 2000);
  console.log('\n=== claimWarranty ===\n', claimFn);
}

dumpFunctions();
