(async (clientId) => {
  if (!clientId || window.wixSiteScript) return;
  window.wixSiteScript = true;
  const api = 'https://www.wixapis.com';
  const key = 'wixSiteScript:' + clientId;
  const cachedToken = () => {
    try {
      const token = JSON.parse(localStorage.getItem(key));
      return token.expiresAt > Date.now() ? token.value : undefined;
    } catch {}
  };
  const mintToken = async () => {
    const res = await fetch(api + '/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, grantType: 'anonymous' }),
    });
    if (!res.ok) throw new Error('oauth2/token ' + res.status);
    const { access_token: value, expires_in: expiresIn } = await res.json();
    try {
      localStorage.setItem(key, JSON.stringify({ value, expiresAt: Date.now() + (expiresIn - 60) * 1000 }));
    } catch {}
    return value;
  };
  const token = cachedToken() ?? (await mintToken());
  const pageUrl = encodeURIComponent(location.origin + location.pathname);
  const res = await fetch(api + '/assets/scripts/v1/site-scripts?pageUrl=' + pageUrl, { headers: { Authorization: token } });
  if (!res.ok) throw new Error('site-scripts ' + res.status);
  const { siteScripts = [] } = await res.json();
  if (document.readyState === 'loading') await new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve));
  if (window.wixEmbedsAPI) return;
  window.__wix_context__ ??= {
    client: { auth: { getTokens: () => ({ accessToken: { value: token } }), getAuthHeaders: async () => ({ headers: { Authorization: token } }) } },
  };
  const seoKey = (el) =>
    el.tagName === 'TITLE' ? 'title'
    : el.tagName === 'META' ? (el.name ? 'meta:name:' + el.name : 'meta:property:' + el.getAttribute('property')).toLowerCase()
    : el.tagName === 'LINK' ? 'link:rel:' + el.rel.toLowerCase()
    : undefined;
  const authoredSeo = new Set([...document.querySelectorAll('title, meta, link')].map(seoKey).filter(Boolean));
  const lateListeners = { DOMContentLoaded: [], load: [] };
  const restoreListeners = [document, window].map((target) => {
    const { addEventListener } = target;
    target.addEventListener = function (type, listener, options) {
      if (type === 'DOMContentLoaded' || (type === 'load' && target === window && document.readyState === 'complete')) {
        lateListeners[type].push([target, listener]);
      } else addEventListener.call(this, type, listener, options);
    };
    return () => (target.addEventListener = addEventListener);
  });
  const inject = async (position, parent, before = null) => {
    const html = siteScripts.filter((script) => script.position === position).map((script) => script.html).join('');
    for (const node of [...document.createRange().createContextualFragment(html).childNodes]) {
      if (node.hasAttribute?.('wix-seo-tag') && authoredSeo.has(seoKey(node))) continue;
      const loads = node.tagName === 'SCRIPT' && node.src && !node.noModule && /^(|module|(text|application)\/javascript)$/i.test(node.type);
      const loaded = loads && new Promise((resolve) => (node.onload = node.onerror = resolve));
      parent.insertBefore(node, before);
      await loaded;
    }
  };
  try {
    await inject('HEAD', document.head);
    await inject('BODY_START', document.body, document.body.firstChild);
    await inject('BODY_END', document.body);
  } finally {
    restoreListeners.forEach((restore) => restore());
  }
  for (const [type, listeners] of Object.entries(lateListeners)) {
    const event = new Event(type);
    for (const [target, listener] of listeners) {
      setTimeout(() => (typeof listener === 'function' ? listener.call(target, event) : listener?.handleEvent(event)));
    }
  }
})(document.currentScript?.dataset.clientId).catch(console.warn);
