const j = require('../data/live-config.json');
const badKey = '[data-be-section="s01"] > div:nth-of-type(2) > div:nth-of-type(1)';
console.log({
  heroMonogram: j.heroMonogram,
  brandLabel: j.brandLabel,
  hasBadOverride: !!(j.visualOverrides && j.visualOverrides.index && j.visualOverrides.index[badKey])
});
