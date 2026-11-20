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
    'padding','margin','margin-left','margin-right','width','max-width','height','min-height','border','border-radius',
    'box-shadow','opacity','display','object-fit','object-position','transform'
  ]);
  const SYSTEM_FONTS = new Set(['Georgia', 'Arial', 'Times New Roman', 'serif', 'sans-serif', 'cursive', 'monospace', 'Keep original']);
  const FONT_CHOICES = [
    // Elegant serifs
    ['Cormorant Garamond', 'serif'], ['Cormorant', 'serif'], ['Cormorant Infant', 'serif'],
    ['Playfair Display', 'serif'], ['Playfair Display SC', 'serif'],
    ['Bodoni Moda', 'serif'], ['Italiana', 'serif'], ['Prata', 'serif'],
    ['EB Garamond', 'serif'], ['Libre Baskerville', 'serif'], ['Libre Caslon Text', 'serif'],
    ['Cinzel', 'serif'], ['Cinzel Decorative', 'serif'], ['Sorts Mill Goudy', 'serif'],
    ['Spectral', 'serif'], ['Lora', 'serif'], ['Merriweather', 'serif'], ['Merriweather Sans', 'sans-serif'],
    ['Cardo', 'serif'], ['Josefin Slab', 'serif'], ['Marcellus', 'serif'], ['Marcellus SC', 'serif'],
    ['Oranienbaum', 'serif'], ['Unna', 'serif'], ['Tinos', 'serif'], ['Instrument Serif', 'serif'],
    ['DM Serif Display', 'serif'], ['DM Serif Text', 'serif'], ['Noto Serif', 'serif'],
    ['Noto Serif Display', 'serif'], ['Source Serif 4', 'serif'], ['Bitter', 'serif'],
    ['Crimson Text', 'serif'], ['Crimson Pro', 'serif'], ['Libre Caslon Display', 'serif'],
    ['Old Standard TT', 'serif'], ['PT Serif', 'serif'], ['PT Serif Caption', 'serif'],
    ['Roboto Serif', 'serif'], ['Rozha One', 'serif'], ['Rufina', 'serif'], ['Sanchez', 'serif'],
    ['Sawarabi Mincho', 'serif'], ['Spectral SC', 'serif'], ['Stix Two Text', 'serif'],
    ['Ultra', 'serif'], ['Vidaloka', 'serif'], ['Vollkorn', 'serif'], ['Yrsa', 'serif'],
    ['Zilla Slab', 'serif'], ['Alegreya', 'serif'], ['Alegreya SC', 'serif'], ['Amiri', 'serif'],
    ['Andada Pro', 'serif'], ['Anton', 'sans-serif'], ['Arapey', 'serif'], ['Arvo', 'serif'],
    ['Bellefair', 'serif'], ['Benne', 'serif'], ['Bentham', 'serif'], ['Besley', 'serif'],
    ['BioRhyme', 'serif'], ['Bodoni Moda SC', 'serif'], ['Bona Nova', 'serif'],
    ['Brawler', 'serif'], ['Bree Serif', 'serif'],
    ['Caladea', 'serif'], ['Cambo', 'serif'], ['Cantata One', 'serif'], ['Caudex', 'serif'],
    ['Ceviche One', 'display'], ['Chakra Petch', 'sans-serif'], ['Charm', 'cursive'],
    ['Charmonman', 'cursive'], ['Copse', 'serif'], ['Cormorant SC', 'serif'],
    ['Cormorant Unicase', 'serif'], ['Cormorant Upright', 'serif'], ['Coustard', 'serif'],
    ['Crete Round', 'serif'], ['Cutive', 'serif'], ['Cutive Mono', 'monospace'],
    ['David Libre', 'serif'], ['Domine', 'serif'], ['Donegal One', 'serif'],
    ['Dosis', 'sans-serif'], ['Eczar', 'serif'], ['Enriqueta', 'serif'],
    ['Fauna One', 'serif'], ['Fenix', 'serif'], ['Fjord One', 'serif'],
    ['Frank Ruhl Libre', 'serif'], ['Fraunces', 'serif'], ['Gabriela', 'serif'],
    ['Gelasio', 'serif'], ['Gentium Book Plus', 'serif'], ['Gentium Plus', 'serif'],
    ['Gilda Display', 'serif'], ['Glegoo', 'serif'], ['Goudy Bookletter 1911', 'serif'],
    ['Graduate', 'serif'], ['Grand Hotel', 'cursive'], ['Grenze', 'serif'],
    ['Gupter', 'serif'], ['Habibi', 'serif'], ['Halant', 'serif'], ['Headland One', 'serif'],
    ['Heebo', 'sans-serif'], ['Hind', 'sans-serif'], ['Holtwood One SC', 'serif'],
    ['IBM Plex Serif', 'serif'], ['Imbue', 'serif'], ['Inika', 'serif'],
    ['Inknut Antiqua', 'serif'], ['Irish Grover', 'display'], ['Istok Web', 'sans-serif'],
    ['Jacques Francois', 'serif'], ['Jomolhari', 'serif'], ['Judson', 'serif'],
    ['Junge', 'serif'], ['Jura', 'sans-serif'], ['Kameron', 'serif'], ['Karma', 'serif'],
    ['Kaushan Script', 'cursive'], ['Kelly Slab', 'display'], ['Khand', 'sans-serif'],
    ['Khula', 'sans-serif'], ['Kokoro', 'serif'], ['Kurale', 'serif'], ['Laila', 'serif'],
    ['Linden Hill', 'serif'], ['Lusitana', 'serif'], ['Lustria', 'serif'],
    ['Ma Shan Zheng', 'cursive'], ['Magra', 'sans-serif'], ['Maiden Orange', 'display'],
    ['Maitree', 'serif'], ['Markazi Text', 'serif'], ['Mate', 'serif'], ['Mate SC', 'serif'],
    ['Maven Pro', 'sans-serif'], ['McLaren', 'display'], ['MedievalSharp', 'display'],
    ['Medula One', 'display'], ['Megrim', 'display'], ['Merienda', 'cursive'],
    ['Metamorphous', 'display'], ['Milonga', 'display'], ['Modern Antiqua', 'serif'],
    ['Montaga', 'serif'], ['MonteCarlo', 'cursive'], ['Montserrat Alternates', 'sans-serif'],
    ['Mr De Haviland', 'cursive'], ['Mrs Sheppards', 'cursive'], ['Neuton', 'serif'],
    ['Newsreader', 'serif'], ['Niconne', 'cursive'], ['Noticia Text', 'serif'],
    ['Noto Serif JP', 'serif'], ['Noto Serif KR', 'serif'], ['Noto Serif SC', 'serif'],
    ['Noto Serif TC', 'serif'], ['Ovo', 'serif'], ['Petrona', 'serif'],
    ['Piazzolla', 'serif'], ['Podkova', 'serif'], ['Poly', 'serif'], ['Port Lligat Slab', 'serif'],
    ['Prociono', 'serif'], ['Quando', 'serif'], ['Quattrocento', 'serif'],
    ['Radley', 'serif'], ['Ramaraja', 'serif'], ['Rasa', 'serif'], ['Rhodium Libre', 'serif'],
    ['Roboto Slab', 'serif'], ['Rokkitt', 'serif'], ['Rosarivo', 'serif'],
    ['Scope One', 'serif'], ['Slabo 13px', 'serif'], ['Slabo 27px', 'serif'],
    ['Solway', 'serif'], ['Song Myung', 'serif'], ['Stardos Stencil', 'display'],
    ['Suez One', 'serif'], ['Sumana', 'serif'], ['Sura', 'serif'], ['Suranna', 'serif'],
    ['Taviraj', 'serif'], ['Texturina', 'serif'], ['Trirong', 'serif'], ['Trykker', 'serif'],
    ['Vesper Libre', 'serif'], ['Volkhov', 'serif'], ['Young Serif', 'serif'],
    // Scripts & calligraphy
    ['Great Vibes', 'cursive'], ['Pinyon Script', 'cursive'], ['Allura', 'cursive'],
    ['Alex Brush', 'cursive'], ['Sacramento', 'cursive'], ['Tangerine', 'cursive'],
    ['Parisienne', 'cursive'], ['Dancing Script', 'cursive'], ['Italianno', 'cursive'],
    ['Mrs Saint Delafield', 'cursive'], ['Rouge Script', 'cursive'], ['Satisfy', 'cursive'],
    ['Cookie', 'cursive'], ['Imperial Script', 'cursive'], ['Pacifico', 'cursive'],
    ['Yellowtail', 'cursive'], ['Lobster', 'cursive'], ['Lobster Two', 'cursive'],
    ['Caveat', 'cursive'], ['Caveat Brush', 'cursive'], ['Homemade Apple', 'cursive'],
    ['Indie Flower', 'cursive'], ['Shadows Into Light', 'cursive'], ['Shadows Into Light Two', 'cursive'],
    ['Amatic SC', 'cursive'], ['Covered By Your Grace', 'cursive'], ['Damion', 'cursive'],
    ['Euphoria Script', 'cursive'], ['Felipa', 'cursive'], ['Fondamento', 'cursive'],
    ['Give You Glory', 'cursive'], ['Gloria Hallelujah', 'cursive'], ['Gochi Hand', 'cursive'],
    ['Handlee', 'cursive'], ['Herr Von Muellerhoff', 'cursive'], ['Hurricane', 'cursive'],
    ['Inspiration', 'cursive'], ['Island Moments', 'cursive'], ['Jim Nightshade', 'cursive'],
    ['Julee', 'cursive'], ['Just Another Hand', 'cursive'], ['Kalam', 'cursive'],
    ['Kristi', 'cursive'], ['La Belle Aurore', 'cursive'], ['League Script', 'cursive'],
    ['Loved by the King', 'cursive'], ['Lovers Quarrel', 'cursive'], ['Marck Script', 'cursive'],
    ['Meddon', 'cursive'], ['Meie Script', 'cursive'], ['Miss Fajardose', 'cursive'],
    ['Monsieur La Doulaise', 'cursive'], ['Mr Bedfort', 'cursive'], ['Mr Dafoe', 'cursive'],
    ['Mrs Sheppards', 'cursive'], ['Neucha', 'cursive'], ['Norican', 'cursive'],
    ['Nothing You Could Do', 'cursive'], ['Over the Rainbow', 'cursive'],
    ['Permanent Marker', 'cursive'], ['Petit Formal Script', 'cursive'],
    ['Princess Sofia', 'cursive'], ['Quintessential', 'cursive'], ['Qwigley', 'cursive'],
    ['Rancho', 'cursive'], ['Reenie Beanie', 'cursive'], ['Rochester', 'cursive'],
    ['Rock Salt', 'cursive'], ['Romanesco', 'cursive'], ['Rouge Script', 'cursive'],
    ['Ruthie', 'cursive'], ['Sail', 'cursive'], ['Sansita', 'sans-serif'],
    ['Sarina', 'cursive'], ['Seaweed Script', 'cursive'], ['Send Flowers', 'cursive'],
    ['Sevillana', 'cursive'], ['Seymour One', 'sans-serif'], ['Shadow', 'display'],
    ['Sofia', 'cursive'], ['Square Peg', 'cursive'], ['Stalemate', 'cursive'],
    ['Style Script', 'cursive'], ['Sunshiney', 'cursive'], ['Swanky and Moo Moo', 'cursive'],
    ['The Girl Next Door', 'cursive'], ['Vibur', 'cursive'], ['Waiting for the Sunrise', 'cursive'],
    ['Walter Turncoat', 'cursive'], ['Whisper', 'cursive'], ['Yesteryear', 'cursive'],
    ['Zeyada', 'cursive'], ['Bad Script', 'cursive'], ['Berkshire Swash', 'cursive'],
    ['Bilbo', 'cursive'], ['Bilbo Swash Caps', 'cursive'], ['Bonbon', 'cursive'],
    ['Calligraffitti', 'cursive'], ['Carattere', 'cursive'], ['Cedarville Cursive', 'cursive'],
    ['Clicker Script', 'cursive'], ['Coming Soon', 'cursive'], ['Condiment', 'cursive'],
    ['Corinthia', 'cursive'], ['Courgette', 'cursive'], ['Crafty Girls', 'cursive'],
    ['Devonshire', 'cursive'], ['Dr Sugiyama', 'cursive'], ['Eagle Lake', 'cursive'],
    ['Engagement', 'cursive'], ['Ephesis', 'cursive'], ['Esteban', 'serif'],
    ['Explora', 'cursive'], ['Festive', 'cursive'], ['Freehand', 'cursive'],
    ['Galada', 'cursive'], ['Grape Nuts', 'cursive'], ['Grechen Fuemen', 'cursive'],
    ['Grey Qo', 'cursive'], ['Griffy', 'display'], ['Habibi', 'serif'],
    // Clean sans
    ['DM Sans', 'sans-serif'], ['Montserrat', 'sans-serif'], ['Manrope', 'sans-serif'],
    ['Josefin Sans', 'sans-serif'], ['Raleway', 'sans-serif'], ['Poppins', 'sans-serif'],
    ['Nunito', 'sans-serif'], ['Nunito Sans', 'sans-serif'], ['Outfit', 'sans-serif'],
    ['Inter', 'sans-serif'], ['Quicksand', 'sans-serif'], ['Work Sans', 'sans-serif'],
    ['Figtree', 'sans-serif'], ['Plus Jakarta Sans', 'sans-serif'], ['Space Grotesk', 'sans-serif'],
    ['Syne', 'sans-serif'], ['Urbanist', 'sans-serif'], ['Mulish', 'sans-serif'],
    ['Karla', 'sans-serif'], ['Barlow', 'sans-serif'], ['Barlow Condensed', 'sans-serif'],
    ['Barlow Semi Condensed', 'sans-serif'], ['Cabin', 'sans-serif'], ['Cairo', 'sans-serif'],
    ['Catamaran', 'sans-serif'], ['Chivo', 'sans-serif'], ['Comfortaa', 'sans-serif'],
    ['Commissioner', 'sans-serif'], ['Encode Sans', 'sans-serif'], ['Exo 2', 'sans-serif'],
    ['Figtree', 'sans-serif'], ['Fira Sans', 'sans-serif'], ['Fjalla One', 'sans-serif'],
    ['Fredoka', 'sans-serif'], ['Gayathri', 'sans-serif'], ['Gemunu Libre', 'sans-serif'],
    ['Genos', 'sans-serif'], ['Geologica', 'sans-serif'],
    ['Golos Text', 'sans-serif'], ['Gotu', 'sans-serif'], ['Gudea', 'sans-serif'],
    ['Hanken Grotesk', 'sans-serif'], ['Harmattan', 'sans-serif'], ['Hind Madurai', 'sans-serif'],
    ['IBM Plex Sans', 'sans-serif'], ['Inconsolata', 'monospace'], ['Instrument Sans', 'sans-serif'],
    ['Jost', 'sans-serif'], ['Kanit', 'sans-serif'], ['Kumbh Sans', 'sans-serif'],
    ['Lato', 'sans-serif'], ['League Spartan', 'sans-serif'], ['Lexend', 'sans-serif'],
    ['Libre Franklin', 'sans-serif'], ['Literata', 'serif'], ['Livvic', 'sans-serif'],
    ['M PLUS 1', 'sans-serif'], ['M PLUS Rounded 1c', 'sans-serif'], ['Manuale', 'serif'],
    ['Martel', 'serif'], ['Martel Sans', 'sans-serif'],
    ['Mukta', 'sans-serif'], ['Noto Sans', 'sans-serif'], ['Noto Sans Display', 'sans-serif'],
    ['Nunito', 'sans-serif'], ['Onest', 'sans-serif'], ['Open Sans', 'sans-serif'],
    ['Oswald', 'sans-serif'], ['Overpass', 'sans-serif'], ['Oxygen', 'sans-serif'],
    ['PT Sans', 'sans-serif'], ['PT Sans Narrow', 'sans-serif'], ['Public Sans', 'sans-serif'],
    ['Puritan', 'sans-serif'], ['Rajdhani', 'sans-serif'], ['Readex Pro', 'sans-serif'],
    ['Red Hat Display', 'sans-serif'], ['Red Hat Text', 'sans-serif'], ['Roboto', 'sans-serif'],
    ['Roboto Condensed', 'sans-serif'], ['Roboto Flex', 'sans-serif'], ['Roboto Mono', 'monospace'],
    ['Rubik', 'sans-serif'], ['Saira', 'sans-serif'], ['Sarabun', 'sans-serif'],
    ['Sora', 'sans-serif'], ['Source Sans 3', 'sans-serif'], ['Space Mono', 'monospace'],
    ['Spline Sans', 'sans-serif'], ['Tajawal', 'sans-serif'], ['Telex', 'sans-serif'],
    ['Tenor Sans', 'sans-serif'], ['Titillium Web', 'sans-serif'], ['Ubuntu', 'sans-serif'],
    ['Varela Round', 'sans-serif'], ['Wix Madefor Display', 'sans-serif'], ['Wix Madefor Text', 'sans-serif'],
    ['Yanone Kaffeesatz', 'sans-serif'], ['Yantramanav', 'sans-serif'],
    // Display / statement
    ['Abril Fatface', 'display'], ['Alfa Slab One', 'display'], ['Bangers', 'display'],
    ['Bebas Neue', 'sans-serif'], ['Big Shoulders Display', 'display'], ['Bungee', 'display'],
    ['Carter One', 'display'], ['Concert One', 'display'],
    ['Contrail One', 'display'], ['Creepster', 'display'], ['Dela Gothic One', 'display'],
    ['Fugaz One', 'display'], ['Lilita One', 'display'], ['Luckiest Guy', 'display'],
    ['Monoton', 'display'], ['Passion One', 'display'], ['Patua One', 'display'],
    ['Paytone One', 'sans-serif'], ['Poiret One', 'display'], ['Righteous', 'display'],
    ['Rowdies', 'display'], ['Russo One', 'sans-serif'], ['Special Elite', 'display'],
    ['Titan One', 'display'], ['UnifrakturMaguntia', 'display'], ['Vast Shadow', 'display']
  ].filter((row, index, all) => all.findIndex(r => r[0] === row[0]) === index);
  const SIMPLE_FONTS = [
    ['', 'Keep original'],
    ...FONT_CHOICES.map(([name, fallback]) => {
      const stack = fallback === 'display' ? 'serif' : fallback;
      return ['"' + name + '", ' + stack, name];
    }),
    ['Georgia, serif', 'Georgia'],
    ['"Times New Roman", Times, serif', 'Times New Roman'],
    ['Arial, sans-serif', 'Arial']
  ];
  const GOOGLE_FONTS = new Set(FONT_CHOICES.map(([name]) => name));
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
  let panel, outline, hoverOutline, sizeHandle, contentRoot, undo = [], redo = [], noteTimer = 0;
  let saving = false;
  let sizeDrag = null;
  const $ = id => document.getElementById(id);
  const escapeSelector = s => (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  const recordMap = () => (state.visualOverrides[PAGE] ||= {});
  const editingRecord = key => (recordMap()[key] ||= { desktop: {}, mobile: {}, tablet: {} });
  const sectionHost = () => document.querySelector(PAGE === 'index' ? 'main' : 'main.hero');
  const inEditor = node => !!node?.closest?.('#be-studio-panel,#be-studio-launch,#be-studio-note,#be-size-handle,#be-saving-veil,#editor,#backdrop,#editButton');
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
  function loadGoogleFont(name) {
    const clean = String(name || '').trim().replace(/^['"]|['"]$/g, '');
    if (!clean || SYSTEM_FONTS.has(clean)) return;
    GOOGLE_FONTS.add(clean);
    const id = 'be-web-font-' + clean.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(clean).replace(/%20/g, '+') + ':ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap';
    document.head.appendChild(link);
  }
  function ensureWebFonts() {
    for (const page of Object.values(state.visualOverrides || {})) {
      if (!page || typeof page !== 'object') continue;
      for (const rec of Object.values(page)) {
        for (const scope of ['desktop', 'tablet', 'mobile']) {
          const val = rec?.[scope]?.['font-family'];
          if (typeof val !== 'string') continue;
          const first = val.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
          if (first && !SYSTEM_FONTS.has(first)) loadGoogleFont(first);
        }
      }
    }
  }
  function parseTranslateX(value) {
    const match = String(value || '').match(/translateX\(\s*(-?\d+(?:\.\d+)?)px\s*\)/i);
    return match ? Number(match[1]) : 0;
  }
  function currentLetterSpacing(el) {
    const stored = editingRecord(targetKey)?.[activeScope]?.['letter-spacing'];
    if (stored != null && stored !== '') {
      const n = parseFloat(stored);
      if (!Number.isNaN(n)) return n;
    }
    const computed = parseFloat(getComputedStyle(el || target).letterSpacing);
    return Number.isFinite(computed) ? Math.round(computed * 10) / 10 : 0;
  }
  function applyLetterSpacing(px, { recordHistory = false } = {}) {
    if (!target || !targetKey) return;
    const size = Math.round(Math.min(40, Math.max(-5, px)) * 10) / 10;
    if (recordHistory) history();
    setValue(targetKey, 'letter-spacing', String(size));
    const label = $('be-letter-label');
    if (label) label.textContent = size + 'px';
    const range = $('be-letter-range');
    if (range) range.value = String(size);
    return size;
  }
  function applyTextShift(deltaPx) {
    if (!target || !targetKey) return;
    history();
    const curr = editingRecord(targetKey)[activeScope] || {};
    const next = Math.round(Math.min(240, Math.max(-240, parseTranslateX(curr.transform) + deltaPx)));
    if (next === 0) setValue(targetKey, 'transform', '');
    else setValue(targetKey, 'transform', 'translateX(' + next + 'px)');
    const label = $('be-shift-label');
    if (label) label.textContent = (next === 0 ? 'Centre line' : (next > 0 ? 'Right ' + next + 'px' : 'Left ' + Math.abs(next) + 'px'));
    notify(next === 0 ? 'Back to centre ✓' : (next > 0 ? 'Moved right ✓' : 'Moved left ✓'));
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
      if (el instanceof HTMLImageElement && Object.prototype.hasOwnProperty.call(rec, 'src')) {
        if (typeof rec.src === 'string' && rec.src && safeImageUrl(rec.src)) {
          if (el.getAttribute('src') !== rec.src) el.setAttribute('src', rec.src);
          el.hidden = false;
        } else {
          el.removeAttribute('src');
          el.hidden = true;
        }
      }
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

  function canDragResize(el) {
    if (!el || el instanceof HTMLImageElement) return false;
    if (el.matches?.('.hero-image,.image-placeholder,figure.look-photo,img')) return false;
    return isTextSafe(el) || ['H1','H2','H3','H4','P','SPAN','A','DIV','FIGCAPTION','STRONG','EM','SMALL'].includes(el.tagName);
  }
  function currentFontPx(el) {
    if (!el) return 24;
    const stored = parseFloat(editingRecord(targetKey)?.[activeScope]?.['font-size']);
    if (stored > 0) return stored;
    return Math.round(parseFloat(getComputedStyle(el).fontSize)) || 24;
  }
  function applyFontSize(px, { recordHistory = false } = {}) {
    if (!target || !targetKey) return;
    const size = Math.round(Math.min(220, Math.max(10, px)));
    if (recordHistory) history();
    setValue(targetKey, 'font-size', String(size));
    const label = $('be-live-size-label');
    if (label) label.textContent = size + 'px';
    const range = $('be-live-size-range');
    if (range) range.value = String(Math.min(Number(range.max) || 220, Math.max(Number(range.min) || 10, size)));
    if (sizeHandle) sizeHandle.dataset.size = size + 'px';
    updateOutline();
    return size;
  }
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
  function placeSizeHandle(el) {
    if (!sizeHandle) return;
    const show = !!(el && document.contains(el) && canDragResize(el) && (document.body.classList.contains('be-studio-open') || picking));
    if (!show) { sizeHandle.style.display = 'none'; return; }
    const rect = el.getBoundingClientRect();
    sizeHandle.style.display = 'flex';
    sizeHandle.style.top = (rect.bottom - 14) + 'px';
    sizeHandle.style.left = (rect.right - 14) + 'px';
    sizeHandle.dataset.size = Math.round(currentFontPx(el)) + 'px';
    sizeHandle.title = 'Drag to make text bigger or smaller';
  }
  function updateOutline() {
    if (!target || !document.contains(target)) target = resolve(targetKey);
    const active = document.body.classList.contains('be-studio-open') || picking ? target : null;
    placeOutline(outline, active);
    placeSizeHandle(active);
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
    root.append(help('Drag the gold corner to resize. Use the buttons to move text, space letters, or change the font.'));

    const fontWrap = document.createElement('div');
    fontWrap.className = 'be-field be-full';
    fontWrap.innerHTML = '<label>Font style (' + FONT_CHOICES.length + '+ fonts)</label>';
    const fontSearch = document.createElement('input');
    fontSearch.type = 'search';
    fontSearch.placeholder = 'Search fonts… e.g. vibes, playfair, script';
    fontSearch.className = 'be-font-search';
    const fontSelect = document.createElement('select');
    fontSelect.className = 'be-font-select';
    fontSelect.size = 8;
    const fillFonts = (query = '') => {
      const q = String(query || '').trim().toLowerCase();
      fontSelect.replaceChildren();
      const keep = document.createElement('option');
      keep.value = '';
      keep.textContent = 'Keep original';
      fontSelect.append(keep);
      for (const [value, label] of SIMPLE_FONTS) {
        if (!value) continue;
        if (q && !label.toLowerCase().includes(q) && !value.toLowerCase().includes(q)) continue;
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        opt.style.fontFamily = value;
        fontSelect.append(opt);
      }
      if (curr['font-family']) fontSelect.value = curr['font-family'];
    };
    fillFonts();
    fontSearch.addEventListener('input', () => fillFonts(fontSearch.value));
    fontSelect.addEventListener('change', () => {
      const v = fontSelect.value;
      history();
      const name = String(v || '').split(',')[0].trim().replace(/^['"]|['"]$/g, '');
      if (name) loadGoogleFont(name);
      setValue(targetKey, 'font-family', v);
      notify(name ? ('Font: ' + name + ' ✓') : 'Original font ✓');
    });
    fontWrap.append(fontSearch, fontSelect);
    root.append(fontWrap);

    const customFont = document.createElement('div');
    customFont.className = 'be-field be-full';
    customFont.innerHTML = '<label>Or type any Google Font name</label>';
    const customRow = document.createElement('div');
    customRow.className = 'be-size-row';
    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.placeholder = 'e.g. Parisienne, Cinzel, Lobster';
    customInput.value = '';
    const customBtn = document.createElement('button');
    customBtn.type = 'button';
    customBtn.textContent = 'Use font';
    customBtn.className = 'be-choice';
    customBtn.addEventListener('click', () => {
      const name = customInput.value.trim().replace(/[<>;{}]/g, '');
      if (!name || name.length > 60) {
        notify('Type a Google Font name, like Great Vibes.');
        return;
      }
      history();
      loadGoogleFont(name);
      const fallback = /script|vibes|allura|brush|sacramento|tangerine|parisienne|italianno|cookie|satisfy|delafield|rouge|imperial|lobster|pacifico|yellowtail|caveat/i.test(name)
        ? 'cursive'
        : 'serif';
      setValue(targetKey, 'font-family', '"' + name + '", ' + fallback);
      notify('Font set to ' + name + ' ✓');
      renderPanel();
    });
    customRow.append(customInput, customBtn);
    customFont.append(customRow);
    root.append(customFont);
    root.append(help('Hundreds of free Google Fonts included. Search above, or type any Google Font name.'));

    const align = document.createElement('div');
    align.className = 'be-size-nudge';
    root.append(align);
    btn(align, '⬅ Left', () => { history(); setValue(targetKey, 'text-align', 'left'); notify('Aligned left ✓'); }, 'be-choice');
    btn(align, 'Center', () => { history(); setValue(targetKey, 'text-align', 'center'); notify('Centered ✓'); }, 'be-choice');
    btn(align, 'Right ➡', () => { history(); setValue(targetKey, 'text-align', 'right'); notify('Aligned right ✓'); }, 'be-choice');

    const shift = document.createElement('div');
    shift.className = 'be-field be-full';
    shift.innerHTML = '<label>Move the words</label>';
    const shiftRow = document.createElement('div');
    shiftRow.className = 'be-size-nudge';
    btn(shiftRow, '← Move left', () => applyTextShift(-16), 'be-choice');
    btn(shiftRow, 'Move right →', () => applyTextShift(16), 'be-choice');
    shift.append(shiftRow);
    const shiftLabel = document.createElement('strong');
    shiftLabel.id = 'be-shift-label';
    const shiftNow = parseTranslateX(curr.transform);
    shiftLabel.textContent = shiftNow === 0 ? 'Centre line' : (shiftNow > 0 ? 'Right ' + shiftNow + 'px' : 'Left ' + Math.abs(shiftNow) + 'px');
    shiftLabel.style.display = 'block';
    shiftLabel.style.marginTop = '8px';
    shift.append(shiftLabel);
    btn(shift, 'Reset position', () => {
      history();
      setValue(targetKey, 'transform', '');
      shiftLabel.textContent = 'Centre line';
      notify('Position reset ✓');
    }, 'be-warn be-full');
    root.append(shift);

    const nudge = document.createElement('div');
    nudge.className = 'be-size-nudge';
    root.append(nudge);
    btn(nudge, 'A− Smaller', () => applyFontSize(currentFontPx(target) - 4, { recordHistory: true }), 'be-choice');
    btn(nudge, 'A+ Bigger', () => applyFontSize(currentFontPx(target) + 4, { recordHistory: true }), 'be-choice');

    const sizeWrap = document.createElement('div');
    sizeWrap.className = 'be-field be-full';
    sizeWrap.innerHTML = '<label>Bigger or smaller</label>';
    const sizeRow = document.createElement('div');
    sizeRow.className = 'be-size-row';
    const sizeRange = document.createElement('input');
    sizeRange.type = 'range';
    sizeRange.id = 'be-live-size-range';
    sizeRange.min = '10';
    sizeRange.max = '220';
    sizeRange.step = '1';
    const currentSize = currentFontPx(target);
    sizeRange.value = String(Math.min(220, Math.max(10, currentSize)));
    const sizeLabel = document.createElement('strong');
    sizeLabel.id = 'be-live-size-label';
    sizeLabel.textContent = sizeRange.value + 'px';
    sizeRange.addEventListener('input', () => {
      applyFontSize(Number(sizeRange.value), { recordHistory: true });
    });
    sizeRow.append(sizeRange, sizeLabel);
    sizeWrap.append(sizeRow);
    root.append(sizeWrap);

    const spaceNudge = document.createElement('div');
    spaceNudge.className = 'be-size-nudge';
    root.append(spaceNudge);
    btn(spaceNudge, 'Tighter letters', () => applyLetterSpacing(currentLetterSpacing(target) - 0.5, { recordHistory: true }), 'be-choice');
    btn(spaceNudge, 'Wider letters', () => applyLetterSpacing(currentLetterSpacing(target) + 0.5, { recordHistory: true }), 'be-choice');

    const letterWrap = document.createElement('div');
    letterWrap.className = 'be-field be-full';
    letterWrap.innerHTML = '<label>Letter spacing</label>';
    const letterRow = document.createElement('div');
    letterRow.className = 'be-size-row';
    const letterRange = document.createElement('input');
    letterRange.type = 'range';
    letterRange.id = 'be-letter-range';
    letterRange.min = '-5';
    letterRange.max = '40';
    letterRange.step = '0.5';
    const letterNow = currentLetterSpacing(target);
    letterRange.value = String(Math.min(40, Math.max(-5, letterNow)));
    const letterLabel = document.createElement('strong');
    letterLabel.id = 'be-letter-label';
    letterLabel.textContent = letterRange.value + 'px';
    letterRange.addEventListener('input', () => {
      applyLetterSpacing(Number(letterRange.value), { recordHistory: true });
    });
    letterRow.append(letterRange, letterLabel);
    letterWrap.append(letterRow);
    root.append(letterWrap);

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

  function invitationPhotoKey(el) {
    if (!el) return '';
    const known = new Set([
      'heroPhoto', 'storyPhoto', 'venuePhoto',
      'moodPhotoTable', 'moodPhotoCake', 'moodPhotoSetting', 'moodPhotoDrapery', 'moodPhotoCeremony'
    ]);
    if (el.id && known.has(el.id)) return el.id;
    const nested = el.querySelector?.('img[id]');
    if (nested?.id && known.has(nested.id)) return nested.id;
    return '';
  }

  function clearInvitationPhoto(key) {
    if (!key || typeof window.getInvitationEditorState !== 'function') return;
    const data = window.getInvitationEditorState();
    if (!data || typeof data !== 'object') return;
    data[key] = '';
    if (data.backgroundPhotos && typeof data.backgroundPhotos === 'object') {
      for (const entry of Object.values(data.backgroundPhotos)) {
        if (entry && typeof entry === 'object' && typeof entry.image === 'string') {
          // leave section backgrounds alone unless explicitly edited here
        }
      }
    }
    if (typeof window.persistWeddingDraft === 'function') window.persistWeddingDraft();
    if (typeof window.renderPhotos === 'function') window.renderPhotos();
    if (typeof window.renderMoodPhotos === 'function') window.renderMoodPhotos();
    if (typeof window.applyBackgroundPhotos === 'function') window.applyBackgroundPhotos();
  }

  function deleteSelectedPhoto() {
    if (!target || !targetKey) {
      notify('Tap a picture first.');
      return;
    }
    if (!confirm('Delete this picture from the website?')) return;
    history();
    const rec = editingRecord(targetKey);
    const photoKey = invitationPhotoKey(target);

    if (target instanceof HTMLImageElement) {
      rec.src = '';
      target.removeAttribute('src');
      target.hidden = true;
    } else {
      for (const scope of ['desktop', 'tablet', 'mobile']) {
        const group = rec[scope];
        if (!group) continue;
        delete group['background-image'];
        delete group['background-size'];
        delete group['background-position'];
      }
      target.style.backgroundImage = '';
      target.style.backgroundSize = '';
      target.style.backgroundPosition = '';
      const nestedImg = target.querySelector?.('img');
      if (nestedImg) {
        nestedImg.removeAttribute('src');
        nestedImg.hidden = true;
        const nestedKey = itemKey(nestedImg);
        if (nestedKey) {
          const nestedRec = editingRecord(nestedKey);
          nestedRec.src = '';
        }
      }
    }

    if (photoKey) clearInvitationPhoto(photoKey);
    saveDraft();
    refreshVisual();
    notify('Picture deleted ✓  Save to website when you are ready.');
    renderPanel();
  }

  function photoEditor(root) {
    const canBg = target.matches('section,header,main,footer,div,article,figure,aside,img,.hero-image,.image-placeholder');
    root.append(help('Pick a new picture from your phone or computer. You can also delete the current one.'));
    if (target instanceof HTMLImageElement) {
      field(root, 'Choose a picture', {
        type: 'file', accept: 'image/*', full: true, value: '',
        onChange: async (_v, input) => {
          const file = input.files?.[0]; if (!file) return;
          try {
            const image = await compressPhoto(file);
            history();
            target.hidden = false;
            setValue(targetKey, 'src', image);
            const photoKey = invitationPhotoKey(target);
            if (photoKey && typeof window.getInvitationEditorState === 'function') {
              const data = window.getInvitationEditorState();
              data[photoKey] = image;
              if (typeof window.persistWeddingDraft === 'function') window.persistWeddingDraft();
              if (typeof window.renderMoodPhotos === 'function') window.renderMoodPhotos();
              if (typeof window.renderPhotos === 'function') window.renderPhotos();
            }
            notify('Picture changed ✓');
            renderPanel();
          } catch { notify('Please use a normal photo (JPG or PNG).'); }
          input.value = '';
        }
      });
      btn(root, '🗑  Delete this picture', deleteSelectedPhoto, 'be-warn be-full');
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
            const photoKey = invitationPhotoKey(target);
            if (photoKey && typeof window.getInvitationEditorState === 'function') {
              const data = window.getInvitationEditorState();
              data[photoKey] = image;
              if (typeof window.persistWeddingDraft === 'function') window.persistWeddingDraft();
              if (typeof window.renderPhotos === 'function') window.renderPhotos();
            }
            notify('Picture changed ✓');
            renderPanel();
          } catch { notify('Please use a normal photo (JPG or PNG).'); }
          input.value = '';
        }
      });
      btn(root, '🗑  Delete this picture', deleteSelectedPhoto, 'be-warn be-full');
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

  function setSavingUi(on, message) {
    saving = !!on;
    document.body.classList.toggle('be-saving', saving);
    let veil = $('be-saving-veil');
    if (saving) {
      if (!veil) {
        veil = document.createElement('div');
        veil.id = 'be-saving-veil';
        veil.innerHTML = '<div class="be-saving-card"><div class="be-saving-spinner" aria-hidden="true"></div><strong>Saving…</strong><p id="be-saving-copy">Uploading your changes</p></div>';
        document.body.append(veil);
      }
      const copy = $('be-saving-copy');
      if (copy) copy.textContent = message || 'Uploading your changes';
      veil.hidden = false;
    } else if (veil) {
      veil.hidden = true;
    }
    const saveBtn = document.querySelector('#be-export-actions .be-save');
    if (saveBtn) {
      saveBtn.disabled = saving;
      saveBtn.textContent = saving ? '⏳ Saving…' : '💾 SAVE TO WEBSITE';
    }
  }

  function adoptSavedConfig(config) {
    if (!config || typeof config !== 'object') return;
    const data = PAGE === 'index' && typeof window.getInvitationEditorState === 'function'
      ? window.getInvitationEditorState()
      : state;

    // Keep one shared object up to date with everything that was saved.
    Object.assign(data, config);
    data.visualOverrides = config.visualOverrides || {};
    data.visualOrder = config.visualOrder || {};
    data.visualTypographyScopes = config.visualTypographyScopes || {};
    data.designTheme = config.designTheme || data.designTheme || {};
    data.visualTheme = config.visualTheme || config.designTheme || data.visualTheme || {};
    data.styleOverrides = config.styleOverrides || {};
    data.backgroundPhotos = config.backgroundPhotos || {};

    state = data;
    if (!state.visualOverrides) state.visualOverrides = {};
    if (!state.visualOrder) state.visualOrder = {};
    if (!state.visualTypographyScopes) state.visualTypographyScopes = {};
    if (!state.designTheme) state.designTheme = {};
    if (!state.visualTheme) state.visualTheme = {...state.designTheme};

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore quota */ }
    if (typeof window.persistWeddingDraft === 'function') window.persistWeddingDraft();
    if (typeof window.apply === 'function') window.apply();
    else {
      if (typeof window.applyDesign === 'function') window.applyDesign();
      if (typeof window.applyBackgroundPhotos === 'function') window.applyBackgroundPhotos();
      if (typeof window.renderPhotos === 'function') window.renderPhotos();
      if (typeof window.renderMoodPhotos === 'function') window.renderMoodPhotos();
    }
    refreshVisual();
  }

  function readyForNextEdit() {
    target = null;
    targetKey = '';
    activeTab = 'words';
    picking = false;
    document.body.classList.remove('be-studio-picking');
    updateOutline();
    renderPanel();
    enableLiveSelect();
  }

  async function publishLive() {
    if (saving) return;
    if (!window.WeddingLive || typeof window.WeddingLive.publish !== 'function') {
      notify('The website server is not running. Ask your helper to start it.');
      return;
    }
    try {
      setSavingUi(true, 'Gathering all your edits…');
      notify('Saving all changes…');
      saveDraft();

      const liveState = PAGE === 'index' && typeof window.getInvitationEditorState === 'function'
        ? window.getInvitationEditorState()
        : state;

      // Full snapshot so every edit (words, photos, colours, layout) is included.
      const publishState = {
        ...liveState,
        ...state,
        designTheme: {...(liveState.designTheme || {}), ...(state.designTheme || {}), ...(state.visualTheme || {})},
        visualTheme: {...(liveState.visualTheme || {}), ...(state.visualTheme || {}), ...(state.designTheme || {})},
        visualOverrides: state.visualOverrides || liveState.visualOverrides || {},
        visualOrder: state.visualOrder || liveState.visualOrder || {},
        visualTypographyScopes: state.visualTypographyScopes || liveState.visualTypographyScopes || {},
        styleOverrides: liveState.styleOverrides || state.styleOverrides || {},
        backgroundPhotos: liveState.backgroundPhotos || state.backgroundPhotos || {}
      };

      setSavingUi(true, 'Uploading photos & saving…');
      const payload = await window.WeddingLive.publish(publishState);
      const saved = payload?.config || publishState;
      adoptSavedConfig(saved);
      readyForNextEdit();
      setSavingUi(false);
      notify('Saved ✓ Tap the next thing to edit.');
    } catch (error) {
      setSavingUi(false);
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
    sizeHandle = document.createElement('button');
    sizeHandle.type = 'button';
    sizeHandle.id = 'be-size-handle';
    sizeHandle.setAttribute('aria-label', 'Drag to resize text');
    sizeHandle.innerHTML = '<span>⤡</span>';
    document.body.append(sizeHandle);
    sizeHandle.addEventListener('pointerdown', event => {
      if (!target || !canDragResize(target)) return;
      event.preventDefault();
      event.stopPropagation();
      history();
      sizeDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startSize: currentFontPx(target)
      };
      sizeHandle.classList.add('be-dragging');
      sizeHandle.setPointerCapture?.(event.pointerId);
      notify('Drag to resize — up/right = bigger, down/left = smaller');
    });

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

  let unlocked = false;
  async function unlockEditor() {
    if (unlocked) return true;
    if (!window.WeddingLive) {
      notify('Website server is not ready yet. Refresh and try again.');
      return false;
    }
    let password = window.WeddingLive.getPassword?.() || '';
    if (!password) {
      password = prompt('Enter the editor password to edit this website:') || '';
      if (!password) return false;
    }
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Editor-Password': password
        },
        body: '{}'
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.ok) {
        window.WeddingLive.setPassword?.('');
        notify(payload.error || 'Wrong password.');
        return false;
      }
      window.WeddingLive.setPassword?.(password);
      unlocked = true;
      return true;
    } catch {
      notify('Could not check the password. Try again.');
      return false;
    }
  }

  async function openStudio() {
    if (!(await unlockEditor())) return;
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
    sizeDrag = null;
    document.body.classList.remove('be-studio-open', 'be-studio-picking', 'be-preview-desktop', 'be-preview-tablet', 'be-preview-mobile');
    document.documentElement.style.removeProperty('--be-preview-width');
    if (hoverOutline) hoverOutline.style.display = 'none';
    if (sizeHandle) {
      sizeHandle.classList.remove('be-dragging');
      sizeHandle.style.display = 'none';
    }
    updateOutline();
  }

  function onSizePointerMove(event) {
    if (!sizeDrag || event.pointerId !== sizeDrag.pointerId) return;
    event.preventDefault();
    const delta = (event.clientX - sizeDrag.startX) + (sizeDrag.startY - event.clientY);
    const next = sizeDrag.startSize + delta * 0.35;
    applyFontSize(next);
  }
  function onSizePointerUp(event) {
    if (!sizeDrag || event.pointerId !== sizeDrag.pointerId) return;
    const finalSize = applyFontSize(currentFontPx(target));
    sizeDrag = null;
    sizeHandle?.classList.remove('be-dragging');
    notify('Size set to ' + finalSize + 'px ✓  Save when you are ready.');
  }
  window.addEventListener('pointermove', onSizePointerMove, { passive: false });
  window.addEventListener('pointerup', onSizePointerUp);
  window.addEventListener('pointercancel', onSizePointerUp);

  document.addEventListener('click', event => {
    if (sizeDrag) return;
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
    // Ask for password before opening the editor panel.
    if (new URLSearchParams(location.search).get('edit') === '1') {
      requestAnimationFrame(() => { openStudio(); });
    }
  }
})();
