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
      const res = await fetch('/api/content', { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
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
      // Always keep embedded defaults underneath published content.
      const published = mergeDeep(defaults, live);
      const merged = isEdit ? mergeDeep(published, local) : published;

      // If the merge is still incomplete, fall back to defaults.
      const safe = looksComplete(merged) ? merged : defaults;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));

      if (typeof window.getInvitationEditorState === 'function') {
        const data = window.getInvitationEditorState();
        // Merge onto existing data — never wipe keys that are missing from a sparse payload.
        Object.assign(data, safe);
        if (typeof window.apply === 'function') window.apply();
        if (typeof window.applyDesign === 'function') window.applyDesign();
        if (typeof window.applyBackgroundPhotos === 'function') window.applyBackgroundPhotos();
        if (typeof window.renderPhotos === 'function') window.renderPhotos();
        if (typeof window.renderMoodPhotos === 'function') window.renderMoodPhotos();
      }
      document.dispatchEvent(new CustomEvent('live-config-loaded', { detail: safe }));
    } catch (error) {
      console.warn('Could not apply live config', error);
    }
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
