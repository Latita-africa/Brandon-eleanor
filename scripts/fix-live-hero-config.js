/**
 * Pull live Blob config, center the hero stack, restore eyebrow size, publish back.
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

function clearDrag(styles, extras = {}) {
  const next = { ...(styles || {}), ...extras };
  delete next.top;
  delete next.left;
  delete next.right;
  delete next.bottom;
  next.transform = 'none';
  next['text-align'] = 'center';
  return next;
}

function cleanConfig(cfg) {
  const out = { ...cfg };
  delete out.brandLabel;
  out.heroMonogram = 'SAVE THE DATE';
  out.heroEyebrow = "WE'RE GETTING MARRIED";

  out.styleOverrides = { ...(out.styleOverrides || {}) };
  out.styleOverrides['edit:heroEyebrow'] = {
    ...(out.styleOverrides['edit:heroEyebrow'] || {}),
    fontSize: '28',
    fontFamily: 'Cormorant Garamond, Georgia, serif'
  };

  const index = { ...((out.visualOverrides && out.visualOverrides.index) || {}) };

  // Old selector forced "B & E" / 38px type onto the eyebrow.
  delete index['[data-be-section="s01"] > div:nth-of-type(2) > div:nth-of-type(1)'];

  const centered = {
    '#heroMonogram': {
      desktop: clearDrag(index['#heroMonogram']?.desktop, { display: 'flex' }),
      mobile: clearDrag(index['#heroMonogram']?.mobile, { display: 'flex' }),
      tablet: {}
    },
    '#heroEyebrow': {
      desktop: clearDrag(index['#heroEyebrow']?.desktop, {
        display: 'block',
        'font-size': '28',
        'letter-spacing': '0.28em'
      }),
      mobile: clearDrag(index['#heroEyebrow']?.mobile, {
        display: 'block',
        'font-size': '20',
        'letter-spacing': '0.22em'
      }),
      tablet: {}
    },
    '#heroNames': {
      desktop: clearDrag(index['#heroNames']?.desktop, { display: 'flex' }),
      mobile: clearDrag(index['#heroNames']?.mobile, { display: 'flex' }),
      tablet: {}
    },
    '#heroFirst': {
      desktop: clearDrag(index['#heroFirst']?.desktop, {
        display: 'block',
        'font-family': '"Pinyon Script", Georgia, serif',
        'letter-spacing': '1.7'
      }),
      mobile: clearDrag(index['#heroFirst']?.mobile, { display: 'block' }),
      tablet: {},
      text: 'Brandon'
    },
    '#heroSecond': {
      desktop: clearDrag(index['#heroSecond']?.desktop, {
        display: 'block',
        'font-family': '"Pinyon Script", Georgia, serif',
        'letter-spacing': '1.7'
      }),
      mobile: clearDrag(index['#heroSecond']?.mobile, { display: 'block' }),
      tablet: {},
      text: 'Eleanor'
    },
    '#heroAmp': {
      desktop: clearDrag(index['#heroAmp']?.desktop, { display: 'block' }),
      mobile: clearDrag(index['#heroAmp']?.mobile, { display: 'block' }),
      tablet: {}
    },
    '#heroDate': {
      desktop: clearDrag(index['#heroDate']?.desktop, { display: 'block', 'font-size': '20' }),
      mobile: clearDrag(index['#heroDate']?.mobile, { display: 'block', 'font-size': '16' }),
      tablet: {}
    },
    '#heroButton': {
      desktop: clearDrag(index['#heroButton']?.desktop, { display: 'inline-flex', 'font-size': '14' }),
      mobile: clearDrag(index['#heroButton']?.mobile, { display: 'inline-flex', 'font-size': '14' }),
      tablet: {}
    }
  };

  // Drop blown-up monogram font sizes from old drags.
  for (const scope of ['desktop', 'mobile']) {
    if (centered['#heroMonogram'][scope]['font-size'] && Number(centered['#heroMonogram'][scope]['font-size']) > 18) {
      delete centered['#heroMonogram'][scope]['font-size'];
    }
  }
  delete centered['#heroMonogram'].text;

  Object.assign(index, centered);

  if (index['#brand']) {
    const brand = { ...index['#brand'] };
    delete brand.text;
    index['#brand'] = brand;
  }

  out.visualOverrides = { ...(out.visualOverrides || {}), index };
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
  console.log('heroEyebrow =', cleaned.heroEyebrow);
  console.log('mono transform =', cleaned.visualOverrides.index['#heroMonogram'].desktop.transform);
  console.log('first transform =', cleaned.visualOverrides.index['#heroFirst'].desktop.transform);
  console.log('eyebrow size =', cleaned.visualOverrides.index['#heroEyebrow'].desktop['font-size']);

  const password = loadEnvPassword();
  if (!password) {
    console.log('No EDITOR_PASSWORD in .env — skipped live publish.');
    return;
  }

  const result = await postJson(LIVE + '/api/content', cleaned, {
    'X-Editor-Password': password
  });
  console.log('Publish status', result.status, result.data.slice(0, 400));
  if (result.status >= 400) process.exitCode = 1;
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
