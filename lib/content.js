'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const CONFIG_PATH = path.join(DATA_DIR, 'live-config.json');
const BLOB_CONFIG_PATH = 'wedding/live-config.json';

function editorPassword() {
  return String(process.env.EDITOR_PASSWORD || 'change-me-to-a-long-secret');
}

function passwordOk(req) {
  const header = String(req.headers['x-editor-password'] || '');
  const auth = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const bodyPass = req.body && typeof req.body.password === 'string' ? req.body.password : '';
  const provided = header || auth || bodyPass;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(editorPassword());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function mergeDeep(base, extra) {
  if (!extra || typeof extra !== 'object') return base;
  const out = Array.isArray(base) ? [...(base || [])] : { ...(base || {}) };
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = mergeDeep(out[key], value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

/** Merge publish body onto saved config, but keep editor layers client-owned. */
function mergePublishedConfig(current, body) {
  const merged = mergeDeep(current || {}, body || {});
  const replaceKeys = [
    'visualOverrides',
    'visualOrder',
    'visualTypographyScopes',
    'styleOverrides',
    'backgroundPhotos',
    'timeline',
    'faqs'
  ];
  for (const key of replaceKeys) {
    if (Object.prototype.hasOwnProperty.call(body || {}, key)) merged[key] = body[key];
  }
  return merged;
}

function defaultConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch { /* ignore */ }
  return {
    firstName: 'Brandon',
    secondName: 'Eleanor',
    visualOverrides: {},
    visualOrder: {},
    visualTypographyScopes: {},
    designTheme: { navy: '#111c38', gold: '#c5a16a', cream: '#f9f7f2' },
    visualTheme: {}
  };
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) return null;
  return {
    mime: match[1].toLowerCase(),
    ext: match[2].toLowerCase().replace('jpeg', 'jpg'),
    buffer: Buffer.from(match[3], 'base64')
  };
}

async function uploadImageBuffer(buffer, ext, prefix = 'live') {
  const name = `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = require('@vercel/blob');
    const result = await put(`wedding/uploads/${name}`, buffer, {
      access: 'public',
      contentType: ext === 'jpg' ? 'image/jpeg' : `image/${ext}`,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return result.url;
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}

async function materializeImages(value, prefix = 'img') {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/')) {
      const parsed = parseDataUrl(value);
      if (!parsed) return value;
      return uploadImageBuffer(parsed.buffer, parsed.ext, prefix);
    }
    const bg = value.match(/^url\(["']?(data:image\/[^"')]+)["']?\)$/i);
    if (bg) {
      const parsed = parseDataUrl(bg[1]);
      if (!parsed) return value;
      const url = await uploadImageBuffer(parsed.buffer, parsed.ext, prefix);
      return `url("${url}")`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    const out = [];
    for (let i = 0; i < value.length; i++) out.push(await materializeImages(value[i], `${prefix}-${i}`));
    return out;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = await materializeImages(nested, `${prefix}-${key}`.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40));
    }
    return out;
  }
  return value;
}

async function readConfig() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = require('@vercel/blob');
      const listed = await list({ prefix: BLOB_CONFIG_PATH, limit: 1, token: process.env.BLOB_READ_WRITE_TOKEN });
      const hit = (listed.blobs || []).find(b => b.pathname === BLOB_CONFIG_PATH) || listed.blobs?.[0];
      if (hit?.url) {
        const res = await fetch(hit.url, { cache: 'no-store' });
        if (res.ok) return await res.json();
      }
    } catch (error) {
      console.warn('Blob config read failed, using defaults', error.message);
    }
    return defaultConfig();
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return defaultConfig();
  }
}

async function writeConfig(config) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = require('@vercel/blob');
    await put(BLOB_CONFIG_PATH, JSON.stringify(config), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = CONFIG_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(config, null, 2));
  fs.renameSync(tmp, CONFIG_PATH);
}

module.exports = {
  passwordOk,
  mergeDeep,
  mergePublishedConfig,
  materializeImages,
  parseDataUrl,
  uploadImageBuffer,
  readConfig,
  writeConfig,
  defaultConfig,
  editorPassword
};
