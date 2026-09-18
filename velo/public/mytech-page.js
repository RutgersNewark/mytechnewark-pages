/**
 * mytech-page.js — one custom element for every myTech content page.
 *
 * Where this goes: Wix Editor > Dev Mode > Public folder, as mytech-page.js.
 * How it is used:  Add > Embed Code > Custom Element, tag name `mytech-page`,
 *                  script = this file, then set the `src` attribute in the
 *                  element's settings panel to the page's HTML URL.
 *
 * What it does
 * ------------
 * Fetches a standalone page HTML file and renders it in a shadow root. That gives
 * the CSS isolation an iframe gave us, without the iframe's two costs: the content
 * is real DOM on the real URL, and the element grows with its content instead of
 * needing a fixed height or a postMessage resize dance.
 *
 * What it does NOT do
 * -------------------
 * Solve SEO by itself. Shadow DOM content is not reliably read by every crawler,
 * which is exactly why Wix gives custom elements a `seoMarkup` property. Pair this
 * with the matching velo/<slug>.js page code, which sets that property to a plain
 * HTML rendering of the same content. The two must stay materially consistent —
 * both are generated from the same source file, which is what keeps that true.
 *
 * Requirements
 * ------------
 * The `src` URL must be served with a permissive CORS header. GitHub Pages sends
 * `Access-Control-Allow-Origin: *`, so files in the mytechnewark-pages repo work.
 * A file that is only on someone's laptop, or only inside a Wix HTML embed, does
 * not — it has to be committed and pushed first.
 */

class MytechPage extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._loaded = null;
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src' && oldValue !== newValue) {
      this._render();
    }
  }

  _shell(inner) {
    // :host must be display:block or the Wix container collapses to zero height.
    this.shadowRoot.innerHTML =
      '<style>:host{display:block;width:100%;}' +
      ':host([hidden]){display:none;}' +
      '.mytech-msg{font:14px/1.6 system-ui,sans-serif;color:#666;padding:24px;}' +
      '</style>' + inner;
  }

  async _render() {
    const src = this.getAttribute('src');
    if (!src) {
      this._shell('<div class="mytech-msg">No <code>src</code> attribute set on this element.</div>');
      return;
    }
    if (this._loaded === src) return;

    try {
      const res = await fetch(src, { credentials: 'omit' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');

      // Carry the source document's own <style> blocks in with the markup. They are
      // scoped to this shadow root, so page styles cannot leak either direction.
      const styles = Array.from(doc.querySelectorAll('style'))
        .map((s) => s.textContent)
        .join('\n');

      // Carry <link rel="stylesheet"> too. The page files load Libre Franklin from
      // Google Fonts this way, and the Wix theme does NOT load it (theme is DM Sans +
      // Inter), so dropping these links renders the page in a fallback face. A <link>
      // works inside a shadow root, which keeps the scoping the styles above rely on.
      // hrefs are resolved against src, since the source document lives elsewhere.
      const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
        .map((l) => l.getAttribute('href'))
        .filter(Boolean)
        .map((href) => {
          try {
            return new URL(href, src).href;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean)
        .map((href) => `<link rel="stylesheet" href="${href}">`)
        .join('');

      Array.from(doc.querySelectorAll('script')).forEach((s) => s.remove());

      this._shell(
        `${links}<style>${styles}</style><div class="mytech-content">${doc.body.innerHTML}</div>`
      );
      this._loaded = src;

      // Let page code react once content is in (e.g. to report height if ever needed).
      this.dispatchEvent(new CustomEvent('mytech-loaded', {
        detail: { src },
        bubbles: true,
        composed: true
      }));
    } catch (err) {
      console.error('mytech-page: could not load', src, err);
      this._shell(
        '<div class="mytech-msg">This content could not be loaded. ' +
        'If you are seeing this on the live site, please report it.</div>'
      );
      this.dispatchEvent(new CustomEvent('mytech-error', {
        detail: { src, message: String(err) },
        bubbles: true,
        composed: true
      }));
    }
  }
}

// A custom element tag must contain a hyphen — that is a web-standard rule.
// Guard the define() so a hot reload or a second script tag cannot throw.
if (!customElements.get('mytech-page')) {
  customElements.define('mytech-page', MytechPage);
}
