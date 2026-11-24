const c = require('../data/live-config.json');
const idx = c.visualOverrides?.index || {};
console.log('keys', Object.keys(idx).length);
for (const [k, v] of Object.entries(idx)) {
  if (v && typeof v.text === 'string') console.log('TEXT', k, '=', v.text.slice(0, 80));
}
for (const [k, v] of Object.entries(idx)) {
  const s = JSON.stringify(v);
  if (s.includes('SAVE THE DATE') || /transform|position:\s*fixed|top:|font-size":"\d{2,}/.test(s)) {
    if (/brand|hero|s01|nav|mono/i.test(k) || s.includes('SAVE THE DATE') || s.includes('transform')) {
      console.log('\n', k);
      console.log(s.slice(0, 400));
    }
  }
}
console.log('brandLabel', c.brandLabel);
console.log('heroMonogram', c.heroMonogram);
