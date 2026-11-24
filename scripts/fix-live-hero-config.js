/**
 * Pull live Blob config, fix SAVE THE DATE / B&E mixups, write local + publish back.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const LOCAL = path.join(ROOT, 'data', 'live-config.json');
const LIVE = process.env.LIVE_URL || 'https://brandon-eleanor.vercel.app';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Cache-Control': 'no-cache' } }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(url + ' -> ' + res.statusCode + ' ' + data.slice(0, 200)));
        else resolve(data);
      });
    }).on('error', reject);
  });
}

function postJson(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify(body));
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function loadEnvPassword() {
  try {
    const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const m = env.match(/^EDITOR_PASSWORD=(.*)$/m);
    return m ? m[1].trim() : '';
  } catch {
    return '';
  }
}

function cleanConfig(cfg) {
  const out = { ...cfg };
  delete out.brandLabel;
  out.heroMonogram = 'SAVE THE DATE';

  // Keep a normal invitation eyebrow — never force initials here.
  if (!out.heroEyebrow || /^[A-Z]\s*&\s*[A-Z]$/i.test(String(out.heroEyebrow).trim()) || /B\s*&\s*E/i.test(String(out.heroEyebrow))) {
    out.heroEyebrow = "We're getting married!";
  }

  if (out.visualOverrides && out.visualOverrides.index) {
    const index = { ...out.visualOverrides.index };

    // Old selector forced "B & E" onto the first div in hero-content (now the eyebrow).
    delete index['[data-be-section="s01"] > div:nth-of-type(2) > div:nth-of-type(1)'];

    // Reset extreme monogram drag/offset so SAVE THE DATE sits in place.
    if (index['#heroMonogram']) {
      const mono = { ...index['#heroMonogram'] };
      for (const scope of ['desktop', 'mobile', 'tablet']) {
        if (!mono[scope]) continue;
        const next = { ...mono[scope] };
        delete next.transform;
        delete next.top;
        delete next.left;
        delete next.right;
        delete next.bottom;
        // Keep readable button size, drop the blown-up 38px drag size.
        if (next['font-size'] && Number(next['font-size']) > 20) delete next['font-size'];
        mono[scope] = next;
      }
      delete mono.text;
      index['#heroMonogram'] = mono;
    }

    // Brand should stay initials, not SAVE THE DATE text override.
    if (index['#brand']) {
      const brand = { ...index['#brand'] };
      delete brand.text;
      index['#brand'] = brand;
    }

    out.visualOverrides = { ...out.visualOverrides, index };
  }

  out.updatedAt = new Date().toISOString();
  return out;
}

(async () => {
  const raw = await get(LIVE + '/api/content?ts=' + Date.now());
  const live = JSON.parse(raw);
  const cleaned = cleanConfig(live);

  fs.mkdirSync(path.dirname(LOCAL), { recursive: true });
  fs.writeFileSync(LOCAL, JSON.stringify(cleaned, null, 2));
  console.log('Wrote cleaned config to data/live-config.json');
  console.log('heroMonogram =', cleaned.heroMonogram);
  console.log('brandLabel removed =', !('brandLabel' in cleaned));
  console.log('heroEyebrow =', cleaned.heroEyebrow);

  const password = loadEnvPassword();
  if (!password) {
    console.log('No EDITOR_PASSWORD in .env — skipped live publish. Open ?edit=1 and Save to website after deploy.');
    return;
  }

  const result = await postJson(LIVE + '/api/content', cleaned, {
    'X-Editor-Password': password
  });
  console.log('Publish status', result.status, result.data.slice(0, 300));
  if (result.status >= 400) process.exitCode = 1;
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
