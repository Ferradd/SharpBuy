async function run() {
  const res = await fetch('https://nfa.shefu223.shop/');
  const html = await res.text();
  const start = html.indexOf('<script>');
  console.log(html.slice(start));
}
run();
