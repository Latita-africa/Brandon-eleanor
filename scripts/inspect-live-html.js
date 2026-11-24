const https = require('https');
https.get('https://brandon-eleanor.vercel.app/', res => {
  let d = '';
  res.on('data', c => { d += c; });
  res.on('end', () => {
    console.log({
      len: d.length,
      headers: (d.match(/<header/g) || []).length,
      brands: (d.match(/id="brand"/g) || []).length,
      monos: (d.match(/id="heroMonogram"/g) || []).length,
      bodies: (d.match(/<body/g) || []).length,
      doctypes: (d.match(/<!DOCTYPE html>/gi) || []).length,
      hasButtonBrand: d.includes('data-edit="brandLabel"'),
      hasAnchorBrand: /id="brand"[^>]*>B/.test(d) || d.includes('href="#home" id="brand"')
    });
    const idx = d.indexOf('<main');
    const slice = d.slice(idx, idx + 2500);
    console.log('--- main start ---');
    console.log(slice);
  });
}).on('error', e => {
  console.error(e);
  process.exit(1);
});
