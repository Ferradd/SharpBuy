/**
 * Lightweight wake/ping endpoint for Render free tier.
 * External schedulers (GitHub Actions, UptimeRobot) hit this to prevent spin-down.
 */

const VISITOR_NAMES = [
  'Alex_M',
  'steam_fan_42',
  'nfa_buyer',
  'guest_7k2',
  'launcher_user',
  'sharp_visitor',
  'night_owl_gamer',
  'token_checker',
];

const VISITOR_REGIONS = ['EU', 'RU', 'US', 'DE', 'PL', 'UA', 'KZ'];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function keepaliveHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const visitor = {
    id: `vis_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    displayName: pick(VISITOR_NAMES),
    region: pick(VISITOR_REGIONS),
    userAgent: String(req.headers['user-agent'] || 'unknown').slice(0, 160),
    source: String(req.headers['x-keepalive-source'] || 'external').slice(0, 40),
    at: new Date().toISOString(),
  };

  console.log(`[KeepAlive] Synthetic visit: ${visitor.displayName} (${visitor.region}) via ${visitor.source}`);

  if (req.method === 'HEAD') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    ok: true,
    alive: true,
    service: 'sharpbuy',
    visitor,
    uptimeSec: Math.floor(process.uptime()),
  });
}
