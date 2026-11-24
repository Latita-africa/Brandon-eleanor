const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'data', 'live-config.json');
const config = JSON.parse(fs.readFileSync(file, 'utf8'));

config.heroMonogram = 'SAVE THE DATE';
delete config.brandLabel;

const idx = config.visualOverrides?.index;
if (idx && typeof idx === 'object') {
  const removeKeys = [];
  for (const key of Object.keys(idx)) {
    const hit =
      key.includes('#brand') ||
      key.includes('heroMonogram') ||
      key.includes('[data-edit="navStory"]') ||
      key.includes('[data-edit="navProgramme"]') ||
      key.includes('[data-edit="navVenue"]') ||
      key.includes('[data-edit="navDetails"]') ||
      key.includes('[data-edit="navRSVP"]') ||
      key.includes('[data-be-section="s01"] > div:nth-of-type(2) > div:nth-of-type(1)') ||
      key.includes('[data-be-section="s01"] > div:nth-of-type(2)');
    if (hit) removeKeys.push(key);
  }
  for (const key of removeKeys) delete idx[key];
  console.log('Removed override keys:\n' + removeKeys.map((k) => ' - ' + k).join('\n'));
}

fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
console.log('Updated live-config heroMonogram + cleaned nav/hero overrides');
