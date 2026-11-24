'use strict';

const { passwordOk } = require('../lib/content');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Editor-Password, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  if (!passwordOk(req)) {
    return res.status(401).json({ ok: false, error: 'Wrong editor password.' });
  }
  return res.status(200).json({ ok: true });
};
