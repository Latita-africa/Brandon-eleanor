/**
 * Local wedding site server.
 * On Vercel, api/*.js + Blob storage are used instead.
 */
'use strict';

const path = require('path');
const express = require('express');
require('dotenv').config();

const {
  passwordOk,
  mergeDeep,
  materializeImages,
  parseDataUrl,
  uploadImageBuffer,
  readConfig,
  writeConfig
} = require('./lib/content');

const ROOT = __dirname;
const SITE_DIR = path.join(ROOT, 'site');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const IMAGES_DIR = path.join(ROOT, 'images');
const PORT = Number(process.env.PORT) || 4173;

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'local-file', editable: true });
});

app.get('/api/content', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await readConfig());
});

app.post('/api/upload', async (req, res) => {
  try {
    if (!passwordOk(req)) return res.status(401).json({ ok: false, error: 'Wrong editor password.' });
    const parsed = parseDataUrl(req.body?.dataUrl || req.body?.image);
    if (!parsed) return res.status(400).json({ ok: false, error: 'Send a data:image… photo.' });
    const url = await uploadImageBuffer(parsed.buffer, parsed.ext, req.body?.prefix || 'photo');
    res.json({ ok: true, url });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || 'Upload failed' });
  }
});

app.post('/api/content', async (req, res) => {
  try {
    if (!passwordOk(req)) return res.status(401).json({ ok: false, error: 'Wrong editor password.' });
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ ok: false, error: 'Expected a JSON object.' });
    }
    const merged = mergeDeep(await readConfig(), req.body);
    const cleaned = await materializeImages(merged, 'live');
    cleaned.updatedAt = new Date().toISOString();
    await writeConfig(cleaned);
    res.json({ ok: true, updatedAt: cleaned.updatedAt, storage: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'local-file' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || 'Save failed' });
  }
});

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', fallthrough: false }));
app.use('/images', express.static(path.join(SITE_DIR, 'images'), { maxAge: '7d' }));
app.use('/images', express.static(IMAGES_DIR, { maxAge: '7d' }));
app.use(express.static(SITE_DIR, {
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/images/')) {
    return res.status(404).send('Not found');
  }
  if (path.extname(req.path)) return res.status(404).send('Not found');
  res.sendFile(path.join(SITE_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Wedding site running at http://127.0.0.1:${PORT}`);
  console.log(`Editor: http://127.0.0.1:${PORT}/index.html?edit=1`);
  console.log(process.env.BLOB_READ_WRITE_TOKEN ? 'Storage: Vercel Blob' : 'Storage: local data/ folder');
});
