'use strict';
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'site', 'index.html');
let s = fs.readFileSync(file, 'utf8');

const oldMono = "document.querySelector('.hero-monogram').textContent=(data.firstName[0]||'B')+' & '+(data.secondName[0]||'E');";
const newMono = "const mono=document.querySelector('.hero-monogram');if(mono){mono.textContent=data.heroMonogram||((data.firstName[0]||'B')+' & '+(data.secondName[0]||'E'));}";
if (!s.includes(oldMono)) {
  console.error('monogram apply line not found');
  process.exit(1);
}
s = s.replace(oldMono, newMono);

const oldDate = "$('heroDate').textContent=`${prettyDate()} · ${data.city}`;";
const newDate = "if($('heroDate')){if(data.heroDateLine){$('heroDate').textContent=data.heroDateLine;}else{$('heroDate').textContent=`${prettyDate()} · ${data.city}`;}}";
if (!s.includes(oldDate)) {
  console.error('heroDate apply line not found');
  process.exit(1);
}
s = s.replace(oldDate, newDate);

// Ensure defaults include new fields inside siteDefaults JSON if missing
if (!s.includes('"heroMonogram"')) {
  s = s.replace('"heroEyebrow":', '"heroMonogram":"B & E","heroDateLine":"","heroEyebrow":');
}

fs.writeFileSync(file, s);
console.log('Hero apply() patched');
