/* Brandon & Eleanor — baby-simple editor (build 2026.11.20.7).
 * Tap anything on the page anytime the editor is open — no extra button needed. */
(() => {
  'use strict';
  const PAGE = location.pathname.toLowerCase().includes('moments') ? 'moments' : 'index';
  const IS_OWNER = new URLSearchParams(location.search).get('edit') === '1' || location.hash === '#edit';
  const STORAGE_KEY = 'weddingSiteConfigNavyV2';
  const CSS_PROPS = new Set([
    'font-size','font-family','font-weight','font-style','line-height','letter-spacing','text-align','text-transform',
    'color','background-color','background-image','background-size','background-position','background-repeat',
    'padding','margin','width','max-width','height','min-height','border','border-radius','box-shadow','opacity',
    'display','object-fit','object-position'
  ]);
  const SIMPLE_FONTS = [
    ['','Keep original'],
    ['"Cormorant Garamond", Georgia, serif','Cormorant Garamond'],
    ['"Playfair Display", Georgia, serif','Playfair Display'],
    ['"Bodoni Moda", Georgia, serif','Bodoni Moda'],
    ['"Great Vibes", cursive','Great Vibes (script)'],
    ['"Pinyon Script", cursive','Pinyon Script'],
    ['"DM Sans", Arial, sans-serif','DM Sans'],
    ['"Montserrat", Arial, sans-serif','Montserrat'],
    ['Georgia, serif','Georgia'],
    ['Arial, sans-serif','Arial']
  ];
  const GOOGLE_FONTS = new Set(['Cormorant Garamond','Playfair Display','Bodoni Moda','Great Vibes','Pinyon Script','DM Sans','Montserrat']);
  const THEME = [
    ['navy','Blue','--wine','#111c38'],
    ['gold','Gold','--gold','#c5a16a'],
    ['cream','Cream','--cream','#f9f7f2'],
    ['ink','Writing colour','--ink','#18223b']
  ];

  const htmlEscape = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getLocal = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } };
  const pubDefaults = (() => { try { return JSON.parse(document.getElementById(PAGE === 'index' ? 'siteDefaults' : 'pageConfig')?.textContent || '{}'); } catch { return {}; } })();
  let state = PAGE === 'index' && typeof window.getInvitationEditorState === 'function'
    ? window.getInvitationEditorState()
    : {...pubDefaults, ...getLocal()};
  if (!state || typeof state !== 'object') state = {...pubDefaults};
  if (!state.visualOverrides || typeof state.visualOverrides !== 'object') state.visualOverrides = {};
  if (!state.visualOrder || typeof state.visualOrder !== 'object') state.visualOrder = {};
  if (!state.visualTypographyScopes || typeof state.visualTypographyScopes !== 'object') state.visualTypographyScopes = {};
  if (!state.designTheme || typeof state.designTheme !== 'object') state.designTheme = {};
  if (!state.visualTheme || typeof state.visualTheme !== 'object') state.visualTheme = {...state.designTheme};

  let target = null, targetKey = '', picking = false, activeTab = 'words', activeScope = 'desktop';
  let panel, outline, hoverOutline, contentRoot, undo = [], redo = [], noteTimer = 0;
  const $ = id => document.getElementById(id);
  const escapeSelector = s => (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  const recordMap = () => (state.visualOverrides[PAGE] ||= {});
  const editingRecord = key => (recordMap()[key] ||= { desktop: {}, mobile: {}, tablet: {} });
  const sectionHost = () => document.querySelector(PAGE === 'index' ? 'main' : 'main.hero');
  const inEditor = node => !!node?.closest?.('#be-studio-panel,#be-studio-launch,#be-studio-note,#editor,#backdrop,#editButton');
  const belongsToPage = el => !!el?.closest?.('body > header,body > main,body > footer') && !inEditor(el);
  const NODE_SKIP = 'script,style,link,meta,noscript,template,svg,path,source,iframe,canvas';

  function itemKey(el) {
    if (!el || !el.tagName) return '';
    if (el.dataset?.beSection) return '[data-be-section="' + el.dataset.beSection + '"]';
    if (el.id && document.querySelectorAll('#' + escapeSelector(el.id)).length === 1) return '#' + escapeSelector(el.id);
    if (el.dataset?.edit && document.querySelectorAll('[data-edit="' + el.dataset.edit.replace(/"/g, '\\"') + '"]').length === 1)
      return '[data-edit="' + el.dataset.edit.replace(/"/g, '\\"') + '"]';
    let item = el, parts = [];
    while (item && item.nodeType === 1 && item !== document.documentElement) {
      if (item.dataset?.beSection) { parts.unshift('[data-be-section="' + item.dataset.beSection + '"]'); break; }
      if (item.id) { parts.unshift('#' + escapeSelector(item.id)); break; }
      const tag = item.tagName.toLowerCase();
      let n = 1, sibling = item.previousElementSibling;
      while (sibling) { if (sibling.tagName === item.tagName) n++; sibling = sibling.previousElementSibling; }
      parts.unshift(tag + ':nth-of-type(' + n + ')');
      item = item.parentElement;
    }
    return parts.join(' > ');
  }
  function resolve(key) { try { const el = document.querySelector(key); return el && !inEditor(el) ? el : null; } catch { return null; } }
  function friendlyName(el) {
    if (!el) return 'Nothing selected yet';
    const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 42);
    if (el.matches('section,[data-be-section]')) return 'Section · ' + (el.querySelector('h1,h2,h3')?.textContent?.trim().slice(0, 28) || el.id || 'block');
    if (el instanceof HTMLImageElement || el.matches('.hero-image,.image-placeholder')) return 'Photo · ' + (el.id || text || 'image');
    if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') return 'Heading · ' + text;
    if (el.tagName === 'P') return 'Paragraph · ' + text;
    if (el.tagName === 'A' || el.tagName === 'BUTTON') return 'Button / link · ' + text;
    return (text || el.tagName.toLowerCase());
  }

  function saveDraft() {
    try {
      if (PAGE === 'index' && typeof window.persistWeddingDraft === 'function') window.persistWeddingDraft();
      else localStorage.setItem(STORAGE_KEY, JSON.stringify({...getLocal(), ...state}));
      return true;
    } catch {
      notify('Storage is full. Try smaller photos, then download the ZIP.');
      return false;
    }
  }
  function snapshot() {
    return JSON.stringify({
      visualOverrides: state.visualOverrides,
      visualOrder: state.visualOrder,
      visualTypographyScopes: state.visualTypographyScopes,
      visualTheme: state.visualTheme,
      designTheme: state.designTheme
    });
  }
  function history() { undo.push(snapshot()); if (undo.length > 40) undo.shift(); redo = []; }
  function restore(from, to) {
    if (!from.length) return;
    to.push(snapshot());
    const restored = JSON.parse(from.pop());
    state.visualOverrides = restored.visualOverrides || {};
    state.visualOrder = restored.visualOrder || {};
    state.visualTypographyScopes = restored.visualTypographyScopes || {};
    state.visualTheme = restored.visualTheme || {};
    state.designTheme = restored.designTheme || state.visualTheme || {};
    saveDraft(); refreshVisual(); renderPanel();
  }

  function setValue(key, field, value, mode = activeScope) {
    if (!key) return;
    const rec = editingRecord(key);
    if (field === 'text' || field === 'src' || field === 'href' || field === 'alt') rec[field] = value;
    else if (field === 'hidden') rec.hidden = !!value;
    else {
      if (!CSS_PROPS.has(field)) return;
      const group = rec[mode] ||= {};
      if (value === '' || value == null) delete group[field];
      else group[field] = String(value);
    }
    saveDraft(); refreshVisual();
  }
  function cssSafe(value, prop) {
    const s = String(value ?? '').trim();
    if (!s || s.length > 700000 || /[{}]|expression\s*\(|javascript\s*:/i.test(s)) return '';
    if (s.includes(';') && !(prop === 'background-image' && /^url\("data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+"\)$/.test(s))) return '';
    return s;
  }
  function mediaRule(scope) {
    return scope === 'mobile' ? '@media (max-width: 699px)' : scope === 'tablet' ? '@media (min-width: 700px) and (max-width: 1099px)' : '';
  }
  function ensureWebFonts() {
    const used = new Set();
    for (const page of Object.values(state.visualOverrides || {})) {
      if (!page || typeof page !== 'object') continue;
      for (const rec of Object.values(page)) {
        for (const scope of ['desktop', 'tablet', 'mobile']) {
          const val = rec?.[scope]?.['font-family'];
          if (typeof val !== 'string') continue;
          const first = val.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
          if (GOOGLE_FONTS.has(first)) used.add(first);
        }
      }
    }
    for (const name of used) {
      const id = 'be-web-font-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (document.getElementById(id)) continue;
      const link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + '&display=swap';
      document.head.appendChild(link);
    }
  }
  function themeSheet() {
    const theme = {...(state.designTheme || {}), ...(state.visualTheme || {})};
    const decls = [];
    for (const [key, , cssVar] of THEME) {
      const val = theme[key];
      if (typeof val === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val.trim())) decls.push(cssVar + ':' + val.trim());
    }
    if (theme.navy) decls.push('--navy:' + theme.navy);
    return decls.length ? ':root{' + decls.join(';') + '}' : '';
  }
  function sheetRules() {
    const all = [];
    const records = recordMap();
    for (const scope of ['desktop', 'tablet', 'mobile']) {
      const rules = [];
      for (const [key, rec] of Object.entries(records)) {
        if (!resolve(key)) continue;
        const styles = rec?.[scope] || {}, decl = [];
        for (const [prop, raw] of Object.entries(styles)) {
          if (!CSS_PROPS.has(prop)) continue;
          let val = cssSafe(raw, prop);
          if (val && ['font-size', 'letter-spacing', 'border-radius'].includes(prop) && /^-?\d+(?:\.\d+)?$/.test(val)) val += 'px';
          if (val) decl.push(prop + ':' + val + ' !important');
        }
        if (scope === 'desktop' && rec.hidden === true) decl.push('display:none !important');
        if (decl.length) rules.push(key + '{' + decl.join(';') + '}');
      }
      if (rules.length) all.push(scope === 'desktop' ? rules.join('\n') : mediaRule(scope) + '{\n' + rules.join('\n') + '\n}');
    }
    return all.join('\n');
  }
  function applySectionOrder() {
    if (PAGE !== 'index') return;
    const root = sectionHost(); if (!root) return;
    const ordered = state.visualOrder?.[PAGE];
    if (!Array.isArray(ordered) || !ordered.length) return;
    const items = [...root.children].filter(x => x.nodeType === 1);
    const pair = new Map(items.map(x => [itemKey(x), x]));
    const final = [...ordered.filter(k => pair.has(k)), ...pair.keys()].filter((v, i, a) => a.indexOf(v) === i).map(k => pair.get(k)).filter(Boolean);
    if (final.every((x, i) => items[i] === x)) return;
    for (const item of final) root.appendChild(item);
  }
  function refreshVisual() {
    ensureWebFonts();
    let style = $('be-studio-applied');
    if (!style) { style = document.createElement('style'); style.id = 'be-studio-applied'; document.head.appendChild(style); }
    const css = [themeSheet(), sheetRules()].filter(Boolean).join('\n');
    if (style.textContent !== css) style.textContent = css;
    for (const [key, rec] of Object.entries(recordMap())) {
      const el = resolve(key); if (!el) continue;
      if (typeof rec.text === 'string' && isTextSafe(el) && el.textContent !== rec.text) el.textContent = rec.text;
      if (typeof rec.alt === 'string' && el instanceof HTMLImageElement && el.alt !== rec.alt) el.alt = rec.alt;
      if (typeof rec.src === 'string' && el instanceof HTMLImageElement && safeImageUrl(rec.src) && el.getAttribute('src') !== rec.src) el.setAttribute('src', rec.src);
      if (typeof rec.href === 'string' && el instanceof HTMLAnchorElement && safeLink(rec.href) && el.getAttribute('href') !== rec.href) el.setAttribute('href', rec.href);
    }
    applySectionOrder();
    updateOutline();
  }
  function isTextSafe(el) {
    if (!el || el.matches(NODE_SKIP) || el.matches('input,select,textarea,form')) return false;
    if (el.closest('#wixRsvpFields,#photoFormFields,#wixPhotoUploadForm')) return false;
    if (el.querySelector('input,select,textarea,form,button,a,img,svg')) return false;
    if (el.tagName === 'BUTTON' && el.children.length) return false;
    if (el.children.length) return false;
    return ['H1','H2','H3','H4','H5','P','SPAN','A','BUTTON','SMALL','STRONG','EM','LABEL','LI','TIME','DIV','FIGCAPTION'].includes(el.tagName);
  }
  function safeLink(value) {
    try {
      const u = new URL(value, location.href);
      return ['https:', 'http:', 'mailto:', 'tel:'].includes(u.protocol) || String(value).startsWith('#') || String(value).startsWith('/');
    } catch { return false; }
  }
  function safeImageUrl(value) { return /^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|\/)/i.test(value); }

  function placeOutline(box, el) {
    if (!box) return;
    if (!el || !document.contains(el)) { box.style.display = 'none'; return; }
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.style.top = rect.top + 'px';
    box.style.left = rect.left + 'px';
    box.style.width = rect.width + 'px';
    box.style.height = rect.height + 'px';
  }
  function updateOutline() {
    if (!target || !document.contains(target)) target = resolve(targetKey);
    placeOutline(outline, document.body.classList.contains('be-studio-open') || picking ? target : null);
  }
  function isLiveSelectActive() {
    return IS_OWNER && (picking || document.body.classList.contains('be-studio-open') || document.body.classList.contains('be-studio-picking'));
  }
  function enableLiveSelect() {
    picking = true;
    document.body.classList.add('be-studio-picking');
  }
  function resolveClickTarget(raw) {
    if (!raw || !(raw instanceof Element) || inEditor(raw)) return null;
    let el = raw.matches(NODE_SKIP) ? raw.parentElement : raw;
    if (!el || inEditor(el)) return null;

    const blocked = el.closest?.('#wixRsvpFields,#photoFormFields,#wixPhotoUploadForm,#guestSearchResults');
    if (blocked && el.matches?.('input,select,textarea,button[type="submit"]')) return null;

    const img = el.closest?.('img');
    if (img && belongsToPage(img)) return img;

    const photoBox = el.closest?.('.hero-image,.image-placeholder,figure.look-photo,#heroPhoto,#storyPhoto,#venuePhoto');
    if (photoBox && belongsToPage(photoBox)) return photoBox.querySelector('img') || photoBox;

    // Prefer the smallest text piece under the click.
    let node = el;
    while (node && node !== document.body) {
      if (!belongsToPage(node)) break;
      if (isTextSafe(node) && (node.textContent || '').trim()) return node;
      if (node.dataset?.edit && belongsToPage(node)) {
        if (isTextSafe(node)) return node;
        const child = [...node.querySelectorAll('h1,h2,h3,h4,p,span,a,button,small,strong,em,label')].find(x => isTextSafe(x) && (x.textContent || '').trim());
        return child || node;
      }
      if (node.matches?.('h1,h2,h3,h4,h5,h6,p,a,button,label,li,figcaption,.btn,.eyebrow,.signature,.brand')) {
        return node;
      }
      if (node.matches?.('section,[data-be-section],header,footer,article,figure')) {
        return node;
      }
      node = node.parentElement;
    }
    return belongsToPage(el) ? el : null;
  }
  function notify(message) {
    const note = $('be-studio-note'); if (!note) return;
    note.textContent = message;
    note.setAttribute('aria-live', 'polite');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => note.removeAttribute('aria-live'), 4000);
  }
  function applyDevicePreview() {
    document.body.classList.remove('be-preview-desktop', 'be-preview-tablet', 'be-preview-mobile');
    document.body.classList.add('be-preview-' + activeScope);
    document.documentElement.style.setProperty('--be-preview-width', activeScope === 'mobile' ? '390px' : '');
    document.getElementById('nav')?.classList.remove('open');
    updateOutline();
  }

  function guessTab(el) {
    if (!el) return 'home';
    if (el instanceof HTMLImageElement || el.matches('.hero-image,.image-placeholder')) return 'photo';
    if (isTextSafe(el)) return 'words';
    if (el.matches('section,[data-be-section],header,footer')) return 'choose';
    return 'look';
  }
  function pick(el) {
    if (!el || inEditor(el) || !belongsToPage(el)) return;
    target = el;
    targetKey = itemKey(el);
    activeTab = guessTab(el);
    enableLiveSelect();
    if (panel && !document.body.classList.contains('be-studio-open')) {
      document.body.classList.add('be-studio-open');
    }
    // Keep live tap mode forever while editing — never require the button again.
    renderPanel();
    updateOutline();
    if (hoverOutline) hoverOutline.style.display = 'none';
    notify('Selected ✓ Tap anything else anytime to edit that instead');
  }
  function startPick() {
    enableLiveSelect();
    // On small screens, hide the panel briefly so the page is easy to tap.
    if (window.matchMedia('(max-width: 650px)').matches) document.body.classList.remove('be-studio-open');
    notify('👆 Tap anything on the page — words, photos, sections…');
  }

  function field(parent, label, opts) {
    const wrap = document.createElement('div');
    wrap.className = 'be-field' + (opts.full ? ' be-full' : '');
    const lab = document.createElement('label');
    lab.textContent = label;
    wrap.append(lab);
    let input;
    if (opts.type === 'textarea') { input = document.createElement('textarea'); input.rows = 4; }
    else if (opts.type === 'select') {
      input = document.createElement('select');
      for (const [val, text] of opts.options || []) {
        const o = document.createElement('option'); o.value = val; o.textContent = text; input.append(o);
      }
    } else {
      input = document.createElement('input');
      input.type = opts.type || 'text';
      if (opts.min != null) input.min = String(opts.min);
      if (opts.max != null) input.max = String(opts.max);
      if (opts.step != null) input.step = String(opts.step);
      if (opts.accept) input.accept = opts.accept;
    }
    if (opts.placeholder) input.placeholder = opts.placeholder;
    input.value = opts.value ?? '';
    input.addEventListener(opts.event || 'change', () => opts.onChange(input.value, input));
    wrap.append(input);
    parent.append(wrap);
    return input;
  }
  function btn(parent, label, action, className = '') {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label; b.className = className;
    b.addEventListener('click', action);
    parent.append(b);
    return b;
  }

  async function compressPhoto(file) {
    if (!file || !file.type.startsWith('image/') || file.size > 15000000) throw new Error('bad image');
    const bitmap = await createImageBitmap(file);
    const max = 1600, scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bitmap.width * scale);
    c.height = Math.round(bitmap.height * scale);
    c.getContext('2d', { alpha: false }).drawImage(bitmap, 0, 0, c.width, c.height);
    bitmap.close?.();
    return c.toDataURL('image/webp', 0.7);
  }

  function help(text) {
    const p = document.createElement('p');
    p.className = 'be-help';
    p.textContent = text;
    return p;
  }
  function stepTitle(root, number, title) {
    const h = document.createElement('div');
    h.className = 'be-step-title';
    h.innerHTML = '<span>' + number + '</span><strong>' + htmlEscape(title) + '</strong>';
    root.append(h);
  }

  function wordsEditor(root) {
    const rec = editingRecord(targetKey);
    if (!isTextSafe(target)) {
      root.append(help('That spot has lots of words together. Tap a smaller line of writing on the page.'));
      return;
    }
    root.append(help('Type the new words here. You will see them change on the page.'));
    field(root, 'Type here', {
      type: 'textarea', full: true,
      value: typeof rec.text === 'string' ? rec.text : target.textContent,
      onChange: value => {
        history();
        if (target.dataset?.edit && PAGE === 'index') {
          state[target.dataset.edit] = value;
          delete rec.text;
          if (typeof window.apply === 'function') window.apply();
        } else setValue(targetKey, 'text', value);
        saveDraft(); refreshVisual();
      }
    });
  }

  function lookEditor(root) {
    const curr = editingRecord(targetKey)[activeScope] || {};
    root.append(help('Make the writing bigger, smaller, or a different colour.'));
    field(root, 'Font style', {
      type: 'select', full: true, value: curr['font-family'] || '', options: SIMPLE_FONTS,
      onChange: v => { history(); setValue(targetKey, 'font-family', v); }
    });
    const sizeWrap = document.createElement('div');
    sizeWrap.className = 'be-field be-full';
    sizeWrap.innerHTML = '<label>Bigger or smaller</label>';
    const sizeRow = document.createElement('div');
    sizeRow.className = 'be-size-row';
    const sizeRange = document.createElement('input');
    sizeRange.type = 'range'; sizeRange.min = '12'; sizeRange.max = '100'; sizeRange.step = '1';
    const currentSize = parseFloat(curr['font-size']) || Math.round(parseFloat(getComputedStyle(target).fontSize)) || 24;
    sizeRange.value = String(Math.min(100, Math.max(12, currentSize)));
    const sizeLabel = document.createElement('strong');
    sizeLabel.textContent = sizeRange.value + 'px';
    sizeRange.addEventListener('input', () => {
      history(); setValue(targetKey, 'font-size', sizeRange.value);
      sizeLabel.textContent = sizeRange.value + 'px';
    });
    sizeRow.append(sizeRange, sizeLabel);
    sizeWrap.append(sizeRow);
    root.append(sizeWrap);
    colorField(root, 'Colour of the words', 'color', curr);
  }

  function colorField(parent, label, prop, curr) {
    const current = curr[prop] || '';
    const row = document.createElement('div');
    row.className = 'be-color-simple be-full';
    parent.append(row);
    const lab = document.createElement('label');
    lab.textContent = label;
    row.append(lab);
    const pick = document.createElement('input');
    pick.type = 'color';
    pick.value = /^#[a-f0-9]{6}$/i.test(current) ? current : '#111c38';
    pick.addEventListener('input', () => { history(); setValue(targetKey, prop, pick.value); });
    row.append(pick);
  }

  function photoEditor(root) {
    const curr = editingRecord(targetKey)[activeScope] || {};
    const canBg = target.matches('section,header,main,footer,div,article,figure,aside,img,.hero-image,.image-placeholder');
    root.append(help('Pick a new picture from your phone or computer.'));
    if (target instanceof HTMLImageElement) {
      field(root, 'Choose a picture', {
        type: 'file', accept: 'image/*', full: true, value: '',
        onChange: async (_v, input) => {
          const file = input.files?.[0]; if (!file) return;
          try {
            const image = await compressPhoto(file);
            history(); setValue(targetKey, 'src', image);
            notify('Picture changed ✓');
          } catch { notify('Please use a normal photo (JPG or PNG).'); }
          input.value = '';
        }
      });
    } else if (canBg) {
      field(root, 'Choose a picture', {
        type: 'file', accept: 'image/*', full: true, value: '',
        onChange: async (_v, input) => {
          const file = input.files?.[0]; if (!file) return;
          try {
            const image = await compressPhoto(file);
            history();
            setValue(targetKey, 'background-image', 'url("' + image + '")');
            setValue(targetKey, 'background-size', 'cover');
            setValue(targetKey, 'background-position', 'center');
            notify('Picture changed ✓');
            renderPanel();
          } catch { notify('Please use a normal photo (JPG or PNG).'); }
          input.value = '';
        }
      });
    } else {
      root.append(help('Tap a picture on the page first.'));
    }
  }

  function siteColours(root) {
    root.append(help('These colours change the whole wedding website.'));
    const theme = {...(state.designTheme || {}), ...(state.visualTheme || {})};
    const grid = document.createElement('div');
    grid.className = 'be-theme-grid';
    root.append(grid);
    for (const [key, label, , fallback] of THEME) {
      const card = document.createElement('div');
      card.className = 'be-theme-card';
      const swatch = document.createElement('input');
      swatch.type = 'color';
      const current = theme[key] || fallback;
      swatch.value = /^#[a-f0-9]{6}$/i.test(current) ? current : fallback;
      const name = document.createElement('strong');
      name.textContent = label;
      swatch.addEventListener('input', () => {
        history();
        state.visualTheme[key] = swatch.value;
        state.designTheme[key] = swatch.value;
        saveDraft();
        if (typeof window.applyDesign === 'function') window.applyDesign();
        refreshVisual();
      });
      card.append(swatch, name);
      grid.append(card);
    }
  }

  function chooseEditor(root) {
    root.append(help('What do you want to change?'));
    const choices = document.createElement('div');
    choices.className = 'be-choice-stack';
    root.append(choices);
    btn(choices, '✏️  Change the writing', () => { activeTab = 'words'; renderPanel(); }, 'be-choice');
    btn(choices, '🎨  Change size & colour', () => { activeTab = 'look'; renderPanel(); }, 'be-choice');
    btn(choices, '📷  Change the picture', () => { activeTab = 'photo'; renderPanel(); }, 'be-choice');
  }

  function moveSection(el, delta) {
    const main = sectionHost(); if (!main) return;
    const arr = [...main.children].filter(x => x.nodeType === 1);
    const pos = arr.indexOf(el), next = pos + delta;
    if (pos < 0 || next < 0 || next >= arr.length) return;
    history();
    [arr[pos], arr[next]] = [arr[next], arr[pos]];
    state.visualOrder[PAGE] = arr.map(itemKey);
    for (const node of arr) main.appendChild(node);
    saveDraft(); refreshVisual(); renderPanel();
  }

  function sectionsSimple(root) {
    if (PAGE !== 'index') {
      root.append(help('On this page, just tap the words or pictures.'));
      return;
    }
    root.append(help('Move a part of the page up or down.'));
    const main = sectionHost(); if (!main) return;
    for (const el of [...main.children].filter(x => x.nodeType === 1)) {
      const row = document.createElement('div');
      row.className = 'be-section-line';
      const name = document.createElement('span');
      name.textContent = el.querySelector('h1,h2,h3')?.textContent?.trim().slice(0, 28) || el.id || 'Part of page';
      row.append(name);
      btn(row, '↑ Up', () => moveSection(el, -1));
      btn(row, '↓ Down', () => moveSection(el, 1));
      root.append(row);
    }
  }

  function renderPanel() {
    if (!contentRoot) return;
    contentRoot.replaceChildren();
    applyDevicePreview();

    const guide = document.createElement('div');
    guide.className = 'be-guide';
    guide.innerHTML =
      '<ol>' +
      '<li><strong>Tap</strong> anything on the page (anytime)</li>' +
      '<li><strong>Change</strong> it here</li>' +
      '<li><strong>Save</strong> at the bottom</li>' +
      '</ol>';
    contentRoot.append(guide);

    stepTitle(contentRoot, '1', 'Tap anything on the page');
    contentRoot.append(help('Just click words, photos or sections on the left. You can keep tapping different things — no button needed.'));
    if (window.matchMedia('(max-width: 650px)').matches) {
      btn(contentRoot, '👆 Hide panel & tap the page', startPick, 'be-primary be-big');
    }

    if (!target) {
      contentRoot.append(help('Nothing selected yet. Tap something on the wedding page.'));
      return;
    }

    const selected = document.createElement('div');
    selected.className = 'be-selected';
    selected.innerHTML = '<strong>Editing now:</strong><span>' + htmlEscape(friendlyName(target)) + '</span><small>Tap something else on the page to switch</small>';
    contentRoot.append(selected);

    const switcher = document.createElement('div');
    switcher.className = 'be-easy-tabs';
    contentRoot.append(switcher);
    for (const [name, label] of [['words', '✏️ Words'], ['look', '🎨 Look'], ['photo', '📷 Picture'], ['colours', '🌈 Site colours'], ['sections', '↕️ Move parts']]) {
      const b = btn(switcher, label, () => { activeTab = name; renderPanel(); });
      if (activeTab === name || (activeTab === 'style' && name === 'look')) b.classList.add('be-on');
    }

    const device = document.createElement('div');
    device.className = 'be-device-bar';
    contentRoot.append(device);
    device.append(Object.assign(document.createElement('span'), { textContent: 'Checking on:' }));
    for (const [value, label] of [['desktop', '💻 Computer'], ['mobile', '📱 Phone']]) {
      const b = btn(device, label, () => { activeScope = value; applyDevicePreview(); renderPanel(); });
      if (activeScope === value) b.classList.add('be-on');
    }

    stepTitle(contentRoot, '2', 'Change it');
    const body = document.createElement('div');
    body.className = 'be-fields';
    contentRoot.append(body);

    const tab = activeTab === 'style' ? 'look' : activeTab;
    if (tab === 'choose') chooseEditor(body);
    else if (tab === 'words') wordsEditor(body);
    else if (tab === 'look') lookEditor(body);
    else if (tab === 'photo') photoEditor(body);
    else if (tab === 'colours') siteColours(body);
    else if (tab === 'sections') sectionsSimple(body);

    const tools = document.createElement('div');
    tools.className = 'be-actions';
    contentRoot.append(tools);
    btn(tools, '↩️ Undo', () => restore(undo, redo)).disabled = !undo.length;
  }

  async function publishLive() {
    if (!window.WeddingLive || typeof window.WeddingLive.publish !== 'function') {
      notify('The website server is not running. Ask your helper to start it.');
      return;
    }
    try {
      notify('Saving to the website…');
      saveDraft();
      const liveState = PAGE === 'index' && typeof window.getInvitationEditorState === 'function'
        ? window.getInvitationEditorState()
        : state;
      const publishState = {
        ...liveState,
        ...state,
        designTheme: {...(state.designTheme || {}), ...(state.visualTheme || {})},
        visualTheme: {...(state.visualTheme || {}), ...(state.designTheme || {})},
        visualOverrides: state.visualOverrides,
        visualOrder: state.visualOrder,
        visualTypographyScopes: state.visualTypographyScopes
      };
      await window.WeddingLive.publish(publishState);
      notify('Saved ✓ Everyone can see your changes after they refresh.');
    } catch (error) {
      notify(error.message || 'Could not save. Check the password and try again.');
    }
  }

  function mount() {
    const launch = document.createElement('button');
    launch.type = 'button';
    launch.id = 'be-studio-launch';
    launch.textContent = '✏️ Edit';
    launch.setAttribute('aria-label', 'Open editor');
    document.body.append(launch);

    outline = document.createElement('div');
    outline.id = 'be-studio-outline';
    outline.setAttribute('aria-hidden', 'true');
    document.body.append(outline);
    hoverOutline = document.createElement('div');
    hoverOutline.id = 'be-studio-hover';
    hoverOutline.setAttribute('aria-hidden', 'true');
    document.body.append(hoverOutline);

    const note = document.createElement('div');
    note.id = 'be-studio-note';
    document.body.append(note);

    panel = document.createElement('aside');
    panel.id = 'be-studio-panel';
    panel.setAttribute('aria-label', 'Easy website editor');
    panel.innerHTML =
      '<header><div><p>Wedding website</p><h2>Make a change</h2></div>' +
      '<button type="button" class="be-close" aria-label="Close">×</button></header>' +
      '<div class="be-inner">' +
      '<div id="be-editor-content"></div>' +
      '<div class="be-divider"></div>' +
      '<div class="be-step-title"><span>3</span><strong>Save your changes</strong></div>' +
      '<div class="be-actions" id="be-export-actions"></div>' +
      '<details class="be-more"><summary>More options</summary><div id="be-more-actions" class="be-actions"></div></details>' +
      '</div>';
    document.body.append(panel);
    contentRoot = $('be-editor-content');
    document.body.append(Object.assign(document.createElement('div'), { id: 'be-preview-frame' }));

    launch.addEventListener('click', openStudio);
    panel.querySelector('.be-close').addEventListener('click', closeStudio);

    const actions = $('be-export-actions');
    btn(actions, '💾 SAVE TO WEBSITE', () => publishLive(), 'be-save be-big');

    const more = $('be-more-actions');
    btn(more, 'Keep on this computer only', () => { saveDraft(); notify('Kept on this computer (not on the live website yet).'); });
    btn(more, 'Set save password', () => {
      const entered = prompt('Password for saving:', window.WeddingLive?.getPassword?.() || '');
      if (entered == null) return;
      window.WeddingLive?.setPassword?.(entered);
      notify('Password ready.');
    });
    btn(more, 'Start again from live website', async () => {
      if (!confirm('Throw away unsaved changes on this computer and reload?')) return;
      try {
        if (window.WeddingLive?.resetBrowserToLive) await window.WeddingLive.resetBrowserToLive();
        else { localStorage.removeItem(STORAGE_KEY); location.reload(); }
      } catch (error) {
        notify(error.message || 'Could not reset.');
      }
    }, 'be-warn');

    const oldLaunch = $('editButton');
    if (oldLaunch) oldLaunch.hidden = true;

    renderPanel();
    if (location.hash === '#visual-editor' || location.hash === '#edit') openStudio();
  }

  function openStudio() {
    document.body.classList.add('be-studio-open');
    enableLiveSelect();
    applyDevicePreview();
    renderPanel();
    if (panel) panel.scrollTop = 0;
    updateOutline();
    notify('Tap anything on the page to edit it. Keep tapping to switch.');
  }
  function closeStudio() {
    picking = false;
    document.body.classList.remove('be-studio-open', 'be-studio-picking', 'be-preview-desktop', 'be-preview-tablet', 'be-preview-mobile');
    document.documentElement.style.removeProperty('--be-preview-width');
    if (hoverOutline) hoverOutline.style.display = 'none';
    updateOutline();
  }

  document.addEventListener('click', event => {
    if (!isLiveSelectActive()) return;
    const el = event.target instanceof Element ? event.target : null;
    if (!el || inEditor(el)) return;
    const candidate = resolveClickTarget(el);
    if (!candidate) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    pick(candidate);
  }, true);

  document.addEventListener('pointermove', event => {
    if (!isLiveSelectActive() || !hoverOutline) return;
    const el = event.target instanceof Element ? event.target : null;
    if (!el || inEditor(el)) { hoverOutline.style.display = 'none'; return; }
    const candidate = resolveClickTarget(el);
    if (!candidate || candidate === target) { hoverOutline.style.display = 'none'; return; }
    placeOutline(hoverOutline, candidate);
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (document.body.classList.contains('be-studio-open')) closeStudio();
    }
  });
  window.addEventListener('scroll', () => { updateOutline(); if (hoverOutline) hoverOutline.style.display = 'none'; }, { passive: true });
  window.addEventListener('resize', updateOutline);
  document.addEventListener('invitation-copy-changed', () => queueMicrotask(refreshVisual));
  document.addEventListener('live-config-loaded', event => {
    const live = event.detail;
    if (!live || typeof live !== 'object') return;
    state = {...state, ...live};
    if (!state.visualOverrides) state.visualOverrides = {};
    if (!state.visualOrder) state.visualOrder = {};
    if (!state.visualTypographyScopes) state.visualTypographyScopes = {};
    if (!state.designTheme) state.designTheme = {};
    if (!state.visualTheme) state.visualTheme = {...state.designTheme};
    refreshVisual();
  });

  refreshVisual();
  if (IS_OWNER) {
    document.body.classList.add('be-studio-owner', PAGE === 'moments' ? 'be-studio-moments' : 'be-studio-index');
    mount();
    if (new URLSearchParams(location.search).get('edit') === '1') requestAnimationFrame(openStudio);
  }
})();
