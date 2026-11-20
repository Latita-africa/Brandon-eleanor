'use strict';

const { passwordOk, parseDataUrl, uploadImageBuffer } = require('../lib/content');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Editor-Password, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    if (!passwordOk(req)) {
      return res.status(401).json({ ok: false, error: 'Wrong editor password.' });
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const dataUrl = body.dataUrl || body.image;
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) {
      return res.status(400).json({ ok: false, error: 'Send a data:image… base64 photo.' });
    }
    if (parsed.buffer.length > 4_500_000) {
      return res.status(413).json({ ok: false, error: 'Image too large. Use a smaller photo.' });
    }
    const url = await uploadImageBuffer(parsed.buffer, parsed.ext, body.prefix || 'photo');
    return res.status(200).json({ ok: true, url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: error.message || 'Upload failed' });
  }
};
