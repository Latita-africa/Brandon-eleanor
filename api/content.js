'use strict';

const { passwordOk, mergePublishedConfig, materializeImages, readConfig, writeConfig } = require('../lib/content');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Editor-Password, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(await readConfig());
    }

    if (req.method === 'POST') {
      if (!passwordOk(req)) {
        return res.status(401).json({ ok: false, error: 'Wrong editor password.' });
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ ok: false, error: 'Expected a JSON object.' });
      }
      const merged = mergePublishedConfig(await readConfig(), body);
      const cleaned = await materializeImages(merged, 'live');
      cleaned.updatedAt = new Date().toISOString();
      await writeConfig(cleaned);
      return res.status(200).json({
        ok: true,
        updatedAt: cleaned.updatedAt,
        storage: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'local-file',
        config: cleaned
      });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: error.message || 'Server error' });
  }
};
