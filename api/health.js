'use strict';

module.exports = async function handler(_req, res) {
  res.status(200).json({
    ok: true,
    mode: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'local-or-unknown',
    editable: true
  });
};
