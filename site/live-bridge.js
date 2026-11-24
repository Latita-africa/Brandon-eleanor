/* Loads published content from the custom server and applies it safely for all visitors. */
(() => {
  'use strict';
  const STORAGE_KEY = 'weddingSiteConfigNavyV2';
  const PASS_KEY = 'weddingEditorPassword';

  function mergeDeep(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    const out = Array.isArray(base) ? [...(base || [])] : { ...(base || {}) };
    for (const [key, value] of Object.entries(extra)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
        out[key] = mergeDeep(out[key], value);
      } else if (value !== undefined) {
        out[key] = value;
      }
    }
    return out;
  }

  function pageDefaults() {
    try {
      const node = document.getElementById('siteDefaults') || document.getElementById('pageConfig');
      return node ? JSON.parse(node.textContent || '{}') : {};
    } catch {
      return {};
    }
  }

  function looksComplete(config) {
    return !!(config && typeof config === 'object' && config.firstName && (config.storyTitle || config.photoPageTitle || config.timeline));
  }

  async function fetchLive() {
    try {
      const res = await fetch('/api/content?ts=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function sanitizeHeroCenter(cfg) {
    if (!cfg || typeof cfg !== 'object') return cfg;
    delete cfg.brandLabel;
    if (!cfg.heroMonogram || /^[A-Z]\s*&\s*[A-Z]$/i.test(String(cfg.heroMonogram).trim())) {
      cfg.heroMonogram = 'SAVE THE DATE';
    }
    if (cfg.heroEyebrow && /^[A-Z]\s*&\s*[A-Z]$/i.test(String(cfg.heroEyebrow).trim())) {
      cfg.heroEyebrow = "WE'RE GETTING MARRIED";
    }
    const index = cfg.visualOverrides && cfg.visualOverrides.index;
    if (!index || typeof index !== 'object') return cfg;
    delete index['[data-be-section="s01"] > div:nth-of-type(2) > div:nth-of-type(1)'];
    const keys = ['#heroMonogram', '#heroEyebrow', '#heroNames', '#heroFirst', '#heroSecond', '#heroAmp', '#heroDate', '#heroButton'];
    for (const key of keys) {
      const rec = index[key];
      if (!rec || typeof rec !== 'object') continue;
      for (const scope of ['desktop', 'mobile', 'tablet']) {
        const styles = rec[scope];
        if (!styles || typeof styles !== 'object') continue;
        delete styles.top;
        delete styles.left;
        delete styles.right;
        delete styles.bottom;
        if (styles.transform && styles.transform !== 'none') styles.transform = 'none';
        styles['text-align'] = 'center';
        if (key === '#heroMonogram') {
          styles.display = 'flex';
          if (styles['font-size'] && Number(styles['font-size']) > 18) delete styles['font-size'];
        }
        if (key === '#heroEyebrow') {
          styles.display = 'block';
          styles['font-size'] = scope === 'mobile' ? '20' : '28';
          styles['letter-spacing'] = scope === 'mobile' ? '0.22em' : '0.28em';
        }
      }
    }
    return cfg;
  }

  function applyToInvitation(live) {
    if (!live || typeof live !== 'object') return;
    try {
      const defaults = pageDefaults();
      let local = {};
      try { local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { local = {}; }

      // Corrupt / sparse browser drafts caused blank pages — discard them.
      if (!looksComplete(local)) local = {};

      const isEdit = new URLSearchParams(location.search).get('edit') === '1' || location.hash === '#edit';
      // Guests always use the live published config (not an old browser draft).
      const published = mergeDeep(defaults, live);
      const merged = isEdit ? mergeDeep(published, local) : published;

      // If the merge is still incomplete, fall back to defaults.
      const safe = sanitizeHeroCenter(looksComplete(merged) ? merged : defaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));

      if (typeof window.getInvitationEditorState === 'function') {
        const data = window.getInvitationEditorState();
        // For guests, replace name/copy fields from live so old localStorage cannot win.
        if (!isEdit) {
          for (const key of Object.keys(safe)) data[key] = safe[key];
        } else {
          Object.assign(data, safe);
        }
        if (typeof window.apply === 'function') window.apply();
        if (typeof window.applyDesign === 'function') window.applyDesign();
        if (typeof window.applyBackgroundPhotos === 'function') window.applyBackgroundPhotos();
        if (typeof window.renderPhotos === 'function') window.renderPhotos();
        if (typeof window.renderMoodPhotos === 'function') window.renderMoodPhotos();
      }
      document.dispatchEvent(new CustomEvent('live-config-loaded', { detail: safe }));
      ensureHeroCenterCss();
    } catch (error) {
      console.warn('Could not apply live config', error);
    }
  }

  function ensureHeroCenterCss() {
    const css = [
      'html body #home .hero-content{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;margin-left:auto!important;margin-right:auto!important}',
      'html body #home #heroMonogram,html body #home .hero-monogram{display:flex!important;margin:0 auto!important;transform:none!important;position:relative!important;left:auto!important;top:auto!important;font-size:clamp(12px,1.45vw,15px)!important}',
      'html body #home #heroEyebrow,html body #home .hero-eyebrow{display:block!important;width:100%!important;max-width:min(44rem,94vw)!important;margin:14px auto 22px!important;text-align:center!important;transform:none!important;font-size:clamp(20px,2.6vw,28px)!important;letter-spacing:.28em!important}',
      'html body #home #heroNames,html body #home h1#heroNames{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;transform:none!important;margin-left:auto!important;margin-right:auto!important}',
      'html body #home #heroFirst,html body #home #heroSecond,html body #home #heroAmp,html body #home #heroDate{display:block!important;margin-left:auto!important;margin-right:auto!important;text-align:center!important;transform:none!important;position:relative!important;left:auto!important;top:auto!important}',
      'html body #home #heroButton,html body #home .hero-content .btn{display:inline-flex!important;margin-left:auto!important;margin-right:auto!important;transform:none!important;position:relative!important;left:auto!important;top:auto!important}'
    ].join('');
    let style = document.getElementById('be-hero-center-fix');
    if (!style) {
      style = document.createElement('style');
      style.id = 'be-hero-center-fix';
    }
    // Keep this after studio styles so transform:none wins.
    document.body.appendChild(style);
    if (style.textContent !== css) style.textContent = css;
  }

  window.WeddingLive = {
    getPassword() {
      try { return sessionStorage.getItem(PASS_KEY) || ''; } catch { return ''; }
    },
    setPassword(value) {
      try { sessionStorage.setItem(PASS_KEY, String(value || '')); } catch { /* ignore */ }
    },
    async uploadDataUrl(dataUrl, prefix) {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Editor-Password': this.getPassword()
        },
        body: JSON.stringify({ dataUrl, prefix })
      });
      const payload = await res.json().catch(() => ({}));
      if (res.status === 401) {
        this.setPassword('');
        throw new Error('Wrong password. Try again.');
      }
      if (!res.ok || !payload.url) throw new Error(payload.error || 'Photo upload failed.');
      return payload.url;
    },
    async replaceEmbeddedPhotos(value, prefix = 'img') {
      if (typeof value === 'string') {
        if (value.startsWith('data:image/')) return this.uploadDataUrl(value, prefix);
        const bg = value.match(/^url\(["']?(data:image\/[^"')]+)["']?\)$/i);
        if (bg) {
          const url = await this.uploadDataUrl(bg[1], prefix);
          return `url("${url}")`;
        }
        return value;
      }
      if (Array.isArray(value)) {
        const out = [];
        for (let i = 0; i < value.length; i++) out.push(await this.replaceEmbeddedPhotos(value[i], prefix + '-' + i));
        return out;
      }
      if (value && typeof value === 'object') {
        const out = {};
        for (const [key, nested] of Object.entries(value)) {
          out[key] = await this.replaceEmbeddedPhotos(nested, (prefix + '-' + key).replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40));
        }
        return out;
      }
      return value;
    },
    async publish(state) {
      const password = this.getPassword();
      if (!password) {
        const entered = prompt('Enter the editor password to publish live:');
        if (!entered) throw new Error('Publish cancelled.');
        this.setPassword(entered);
      }
      // Upload photos first (needed for Vercel body size limits), then save config.
      const ready = await this.replaceEmbeddedPhotos(state, 'live');
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Editor-Password': this.getPassword()
        },
        body: JSON.stringify(ready)
      });
      const payload = await res.json().catch(() => ({}));
      if (res.status === 401) {
        this.setPassword('');
        throw new Error('Wrong password. Try again.');
      }
      if (!res.ok || !payload.ok) throw new Error(payload.error || 'Could not publish.');
      // Prefer server config (photos already turned into real URLs).
      return { ...payload, config: payload.config || ready };
    },
    async resetBrowserToLive() {
      localStorage.removeItem(STORAGE_KEY);
      const live = await fetchLive();
      applyToInvitation(live || {});
      location.reload();
    },
    refresh: fetchLive
  };

  fetchLive().then(live => {
    if (!live) return;
    let tries = 0;
    const tick = () => {
      applyToInvitation(live);
      tries += 1;
      if (tries < 20 && typeof window.apply !== 'function') setTimeout(tick, 50);
    };
    tick();
  });
})();
